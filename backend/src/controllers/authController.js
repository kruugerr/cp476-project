export const userRegister = (req, res) => {
    const { email, password } = req.body;
    console.log("Received registration request:", { email, password });
};

export const userLogin = (req, res) => {
    const { email, password } = req.body;
    console.log("Received login request:", { email, password });
};

export const userForgotPassword = (req, res) => {
    const { email } = req.body;
    console.log("Received email for password reset:", email);
    // Send the password reset link to user
    // ...
};

export const userResetPassword = (req, res) => {
    const { email, newPassword } = req.body;
    console.log("Received password reset request:", { email, newPassword });
};
