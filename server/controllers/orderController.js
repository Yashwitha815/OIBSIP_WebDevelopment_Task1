import crypto from "crypto";

import Order from "../models/Order.js";
import Pizza from "../models/Pizza.js";
import PizzaRecipe from "../models/PizzaRecipe.js";
import Inventory from "../models/Inventory.js";

const ALLOWED_PAYMENT_METHODS = ["Razorpay", "COD"];

// ======================================================
// CALCULATE ORDER TOTALS
// ======================================================

const calculateTotals = (items) => {
  const subtotal = items.reduce(
    (total, item) =>
      total +
      Number(item.singlePizzaPrice ?? item.price ?? 0) *
        Number(item.quantity ?? 0),
    0,
  );

  const gst = subtotal * 0.05;
  const deliveryCharge = subtotal >= 299 ? 0 : 40;
  const totalAmount = subtotal + gst + deliveryCharge;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    gst: Number(gst.toFixed(2)),
    deliveryCharge,
    totalAmount: Number(totalAmount.toFixed(2)),
  };
};

// ======================================================
// GET USER ID
// ======================================================

const getUserId = (req) =>
  req.user?._id || req.user?.id || req.user?.userId;

// ======================================================
// VALIDATE ORDER ITEMS
// ======================================================

const validateItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return "Order must contain at least one item";
  }

  const hasInvalidItem = items.some(
    (item) =>
      !item?.name ||
      Number(item.quantity) < 1 ||
      Number(item.singlePizzaPrice ?? item.price) < 0,
  );

  return hasInvalidItem ? "Invalid order item details" : null;
};

// ======================================================
// MAP CART ITEMS INTO ORDER ITEMS
// ======================================================

const mapOrderItems = (items) =>
  items.map((item) => ({
    pizzaId: item._id || item.pizzaId || null,
    name: item.name,
    quantity: Number(item.quantity),
    price: Number(item.singlePizzaPrice ?? item.price ?? 0),
    image: item.image || "",
    cartId: item.cartId || "",
    size: item.size || "",
    crust: item.crust || "",
    toppings: Array.isArray(item.toppings) ? item.toppings : [],
  }));

// ======================================================
// DEDUCT INVENTORY WHEN ORDER IS DELIVERED
// ======================================================

const deductInventoryForOrder = async (order) => {
  const deductions = new Map();

  for (const item of order.items) {
    let recipe = null;

    // ==================================================
    // 1. USE pizzaId IF THE ORDER HAS IT
    // ==================================================

    if (item.pizzaId) {
      recipe = await PizzaRecipe.findOne({
        pizzaId: item.pizzaId,
      }).lean();
    }

    // ==================================================
    // 2. OLD ORDERS MAY NOT HAVE pizzaId
    //    FIND THE RECIPE USING PIZZA NAME
    // ==================================================

    if (!recipe && item.name) {
      const recipes = await PizzaRecipe.find()
        .populate("pizzaId", "name")
        .lean();

      recipe = recipes.find((r) => {
        if (!r.pizzaId?.name) return false;

        return (
          String(r.pizzaId.name)
            .trim()
            .toLowerCase() ===
          String(item.name)
            .trim()
            .toLowerCase()
        );
      });
    }

    // ==================================================
    // 3. RECIPE NOT FOUND
    // ==================================================

    if (!recipe) {
      throw new Error(
        `No recipe found for "${item.name}".`,
      );
    }

    // ==================================================
    // 4. CALCULATE INGREDIENT REQUIREMENTS
    // ==================================================

    for (const ingredient of recipe.ingredients || []) {
      const inventoryId = String(
        ingredient.inventoryItem,
      );

      const recipeQuantity = Number(
        ingredient.quantity,
      );

      const orderQuantity = Number(
        item.quantity || 1,
      );

      const requiredQuantity =
        recipeQuantity * orderQuantity;

      if (
        !Number.isFinite(requiredQuantity) ||
        requiredQuantity <= 0
      ) {
        continue;
      }

      const previousQuantity =
        deductions.get(inventoryId) || 0;

      deductions.set(
        inventoryId,
        previousQuantity + requiredQuantity,
      );
    }
  }

  // ==================================================
  // 5. NOTHING TO DEDUCT
  // ==================================================

  if (deductions.size === 0) {
    return {
      deductedItems: 0,
    };
  }

  // ==================================================
  // 6. GET INVENTORY ITEMS
  // ==================================================

  const inventoryIds = Array.from(
    deductions.keys(),
  );

  const inventoryItems = await Inventory.find({
    _id: {
      $in: inventoryIds,
    },
  });

  const inventoryMap = new Map(
    inventoryItems.map((item) => [
      String(item._id),
      item,
    ]),
  );

  // ==================================================
  // 7. CHECK STOCK BEFORE DEDUCTING
  // ==================================================

  for (const [
    inventoryId,
    requiredQuantity,
  ] of deductions) {
    const inventoryItem =
      inventoryMap.get(inventoryId);

    if (!inventoryItem) {
      throw new Error(
        "One or more recipe ingredients were not found in inventory.",
      );
    }

    const availableQuantity = Number(
      inventoryItem.quantity,
    );

    if (availableQuantity < requiredQuantity) {
      throw new Error(
        `Insufficient stock for "${inventoryItem.itemName}". Available: ${availableQuantity} ${inventoryItem.unit}, Required: ${requiredQuantity} ${inventoryItem.unit}.`,
      );
    }
  }

  // ==================================================
  // 8. CREATE STOCK UPDATE OPERATIONS
  // ==================================================

  const operations = [];

  for (const [
    inventoryId,
    requiredQuantity,
  ] of deductions) {
    operations.push({
      updateOne: {
        filter: {
          _id: inventoryId,
          quantity: {
            $gte: requiredQuantity,
          },
        },

        update: {
          $inc: {
            quantity: -requiredQuantity,
          },
        },
      },
    });
  }

  // ==================================================
  // 9. DEDUCT STOCK
  // ==================================================

  if (operations.length > 0) {
    const result = await Inventory.bulkWrite(
      operations,
    );

    if (
      result.modifiedCount !==
      operations.length
    ) {
      throw new Error(
        "Inventory could not be updated completely.",
      );
    }
  }

  return {
    deductedItems: deductions.size,
  };
};

// ======================================================
// CREATE ORDER - COD
// POST /api/orders
// ======================================================

export const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      items,
      paymentMethod,
    } = req.body;

    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    if (!customerName || !customerEmail) {
      return res.status(400).json({
        success: false,
        message:
          "Customer name and email are required",
      });
    }

    if (paymentMethod !== "COD") {
      return res.status(400).json({
        success: false,
        message:
          "Use the Razorpay verification flow for online payments",
      });
    }

    const itemError = validateItems(items);

    if (itemError) {
      return res.status(400).json({
        success: false,
        message: itemError,
      });
    }

    const totals = calculateTotals(items);

    const order = await Order.create({
      user: userId,
      customerName,
      customerEmail,
      items: mapOrderItems(items),
      ...totals,
      status: "Order Received",
      paymentStatus: "Pending",
      paymentMethod: "COD",
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};

// ======================================================
// CREATE RAZORPAY ORDER
// POST /api/orders/razorpay/create
// ======================================================

export const createRazorpayOrder = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    if (
      !process.env.RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET
    ) {
      return res.status(500).json({
        success: false,
        message:
          "Razorpay keys are not configured on the server",
      });
    }

    const { items } = req.body;

    const itemError = validateItems(items);

    if (itemError) {
      return res.status(400).json({
        success: false,
        message: itemError,
      });
    }

    const totals = calculateTotals(items);

    const amountInPaise = Math.round(
      totals.totalAmount * 100,
    );

    const receipt = `pv_${Date.now()}_${String(
      userId,
    ).slice(-6)}`;

    const auth = Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
    ).toString("base64");

    const razorpayResponse = await fetch(
      "https://api.razorpay.com/v1/orders",
      {
        method: "POST",

        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt,

          notes: {
            source: "PizzaVerse",
            userId: String(userId),
          },
        }),
      },
    );

    const razorpayData =
      await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      console.error(
        "Razorpay Create Order Error:",
        razorpayData,
      );

      return res.status(502).json({
        success: false,
        message:
          razorpayData?.error?.description ||
          "Unable to create Razorpay order",
      });
    }

    return res.status(200).json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrder: razorpayData,
      totals,
    });
  } catch (error) {
    console.error(
      "Razorpay Create Order Error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to initialize online payment",
    });
  }
};

// ======================================================
// VERIFY RAZORPAY PAYMENT + CREATE ORDER
// POST /api/orders/razorpay/verify
// ======================================================

export const verifyRazorpayPayment = async (
  req,
  res,
) => {
  try {
    const userId = getUserId(req);

    const {
      customerName,
      customerEmail,
      items,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    if (!customerName || !customerEmail) {
      return res.status(400).json({
        success: false,
        message:
          "Customer name and email are required",
      });
    }

    const itemError = validateItems(items);

    if (itemError) {
      return res.status(400).json({
        success: false,
        message: itemError,
      });
    }

    if (
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Incomplete Razorpay payment details",
      });
    }

    if (
      !process.env.RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET
    ) {
      return res.status(500).json({
        success: false,
        message:
          "Razorpay credentials are not configured on the server",
      });
    }

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET,
      )
      .update(
        `${razorpayOrderId}|${razorpayPaymentId}`,
      )
      .digest("hex");

    if (
      generatedSignature.length !==
        razorpaySignature.length ||
      !crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(razorpaySignature),
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    const totals = calculateTotals(items);

    const expectedAmount = Math.round(
      totals.totalAmount * 100,
    );

    const auth = Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
    ).toString("base64");

    const razorpayOrderResponse = await fetch(
      `https://api.razorpay.com/v1/orders/${razorpayOrderId}`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      },
    );

    const razorpayOrder =
      await razorpayOrderResponse.json();

    if (
      !razorpayOrderResponse.ok ||
      Number(razorpayOrder.amount) !== expectedAmount ||
      razorpayOrder.notes?.userId !== String(userId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment amount or order ownership could not be verified",
      });
    }

    const order = await Order.create({
      user: userId,
      customerName,
      customerEmail,
      items: mapOrderItems(items),
      ...totals,
      status: "Order Received",
      paymentStatus: "Paid",
      paymentMethod: "Razorpay",
      razorpayOrderId,
      razorpayPaymentId,
    });

    return res.status(201).json({
      success: true,
      message:
        "Payment verified and order created successfully",
      order,
    });
  } catch (error) {
    console.error(
      "Razorpay Verification Error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to verify payment and create order",
    });
  }
};

// ======================================================
// GET ALL ORDERS - ADMIN
// GET /api/orders/admin
// ======================================================

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

// ======================================================
// GET SINGLE ORDER - ADMIN
// GET /api/orders/admin/:id
// ======================================================

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(
      req.params.id,
    ).populate("user", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

// ======================================================
// UPDATE ORDER STATUS - ADMIN
// PUT /api/orders/admin/:id/status
// ======================================================

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Order Received",
      "In Kitchen",
      "Sent to Delivery",
      "Delivered",
    ];

    if (
      !status ||
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(
      req.params.id,
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ==================================================
    // DEDUCT INVENTORY ONLY WHEN DELIVERED
    // ==================================================

    if (
      status === "Delivered" &&
      !order.stockDeducted
    ) {
      try {
        const result =
          await deductInventoryForOrder(order);

        order.stockDeducted = true;
        order.stockDeductedAt = new Date();

        console.log(
          `Inventory deducted for order ${order._id}. ` +
            `Inventory items affected: ${result.deductedItems}`,
        );
      } catch (inventoryError) {
        console.error(
          "Inventory Deduction Error:",
          inventoryError,
        );

        return res.status(400).json({
          success: false,
          message:
            inventoryError.message ||
            "Unable to deduct inventory for this order",
        });
      }
    }

    order.status = status;

    await order.save();

    return res.status(200).json({
      success: true,

      message:
        status === "Delivered" &&
        order.stockDeducted
          ? "Order delivered and inventory updated successfully"
          : "Order status updated successfully",

      order,
    });
  } catch (error) {
    console.error(
      "Update Order Status Error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

// ======================================================
// GET MY ORDERS - CUSTOMER
// GET /api/orders/my-orders
// ======================================================

export const getMyOrders = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const orders = await Order.find({
      user: userId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(
      "Get My Orders Error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your orders",
    });
  }
};