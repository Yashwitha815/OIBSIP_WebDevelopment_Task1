import Order from "../models/Order.js";

// ======================================================
// CREATE ORDER
// POST /api/orders
// ======================================================

export const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      items,
      subtotal,
      gst,
      deliveryCharge,
      totalAmount,
      paymentStatus,
      paymentMethod,
      razorpayOrderId,
      razorpayPaymentId,
    } = req.body;

    // --------------------------------------------------
    // GET LOGGED-IN USER
    // --------------------------------------------------

    const userId =
      req.user?._id ||
      req.user?.id ||
      req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    // --------------------------------------------------
    // VALIDATE CUSTOMER DETAILS
    // --------------------------------------------------

    if (!customerName || !customerEmail) {
      return res.status(400).json({
        success: false,
        message: "Customer name and email are required",
      });
    }

    // --------------------------------------------------
    // VALIDATE ITEMS
    // --------------------------------------------------

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item",
      });
    }

    // --------------------------------------------------
    // VALIDATE AMOUNTS
    // --------------------------------------------------

    if (
      subtotal === undefined ||
      gst === undefined ||
      deliveryCharge === undefined ||
      totalAmount === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Order amount details are required",
      });
    }

    // --------------------------------------------------
    // CREATE ORDER
    // --------------------------------------------------

    const order = await Order.create({
      user: userId,

      customerName,
      customerEmail,

      items,

      subtotal,
      gst,
      deliveryCharge,
      totalAmount,

      // New orders always start here
      status: "Order Received",

      // Payment details
      paymentStatus: paymentStatus || "Pending",
      paymentMethod: paymentMethod || "Razorpay",

      razorpayOrderId: razorpayOrderId || null,
      razorpayPaymentId: razorpayPaymentId || null,
    });

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

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
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

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

    // --------------------------------------------------
    // VALIDATE STATUS
    // --------------------------------------------------

    const allowedStatuses = [
      "Order Received",
      "In Kitchen",
      "Sent to Delivery",
      "Delivered",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    // --------------------------------------------------
    // FIND ORDER
    // --------------------------------------------------

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // --------------------------------------------------
    // UPDATE STATUS
    // --------------------------------------------------

    order.status = status;

    await order.save();

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });

  } catch (error) {
    console.error("Update Order Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};