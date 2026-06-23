const jwt = require('jsonwebtoken');
const config = {
    jwtKey: "tubulu_secret_key_2026",
    tokenValidity: "365d"
};
const payload = {
    id: "f8683a34-d61c-c4e4-4920-619770000000",
    phoneNumber: "8989898989",
    role: "user"
};
const token = jwt.sign(payload, config.jwtKey, { expiresIn: config.tokenValidity });
console.log(token);
