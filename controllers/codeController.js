const { findById } = require('../models/code');
const Code = require('../models/code');
const User = require('../models/user');

exports.getAllCode = async (req, res) => {
    try {
        const code = await Code.find({});
        res.json({
            status: 'success',
            code
        });
    } catch (err) {
        res.json({
            status: 'failed',
            errors: err
        });
    }
};

exports.createCode = async (req, res) => {
    try {
        const { userID } = req.user;
        const admin = await User.findById(userID);
        if (admin.role === 'admin') {
            const code = await Code.create({
                code: req.body.code,
                discount: req.body.discount,
                type: req.body.type,
                expirationDate: new Date(req.body.expirationDate), // Thêm trường expirationDate
                quantity: req.body.quantity // Thêm trường số lượng
            });
            res.json({
                status: 'success',
                code
            });
        } else {
            res.json({
                messenger: "Không đủ quyền"
            });
        }
    } catch (err) {
        res.json({
            status: 'failed',
            errors: err
        });
    }
};

exports.deleteOneCode = async (req, res) => {
    try {
        const { userID } = req.user;
        const admin = await User.findById(userID);
        if (admin.role === 'admin') {
            await Code.findByIdAndDelete(req.params.id);
            res.json({
                status: "success"
            });
        } else {
            res.json({
                messenger: "Không đủ quyền"
            });
        }
    } catch (err) {
        res.json({
            status: 'failed',
            errors: err
        });
    }
};

exports.getOneCode = async (req, res) => {
    try {
        const { id } = req.params;
        const code = await Code.findById(id);
        res.json({
            status: "success",
            code
        });
    } catch (err) {
        res.json({
            status: "failed",
            errors: err
        });
    }
};

exports.editOneCode = async (req, res) => {
    try {
        const { id } = req.params;
        await Code.findByIdAndUpdate(id, { ...req.body }, { runValidators: true, new: true });
        res.json({
            status: "success"
        });
    } catch (err) {
        res.json({
            status: 'failed',
            errors: err
        });
    }
};

exports.checkCode = async (req, res) => {
    try {
        const { code } = req.body;
        const coupon = await Code.findOne({ code: code });
        if (coupon) {
            const currentDate = new Date();
            if (coupon.expirationDate < currentDate) {
                res.json({
                    status: "failed",
                    messenger: "Mã giảm giá đã hết hạn"
                });
            } else if (coupon.quantity > 0) {
                // Giảm số lượng mã giảm giá
                coupon.quantity -= 1;
                await coupon.save();

                res.json({
                    status: "success",
                    coupon
                });
            } else {
                res.json({
                    status: "failed",
                    messenger: "Mã giảm giá đã hết số lượng"
                });
            }
        } else {
            res.json({
                status: "failed",
                messenger: "Mã giảm giá không tồn tại"
            });
        }
    } catch (err) {
        res.json({
            status: 'failed',
            errors: err
        });
    }
};