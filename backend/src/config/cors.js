const cors = function (req, res, next) {
    res.header(
        "Access-Control-Allow-Origin",
        req.headers.origin || "*"
    );

    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );

    res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
};

export default cors;
