const error = (err, req, res, next) => {
    console.log(err.message);
    res.status(err.statusCode).json({
        success: err.success,
        message: err.message,
        data: err.data,
        errors: err.errors,
    });
};
export { error };
