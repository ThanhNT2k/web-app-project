// server/Models/userModel.js
// Model cho người dùng (placeholder)

class User {
  constructor({ id, name, email, password }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password; // Lưu ý: không lưu mật khẩu thô trong thực tế
  }
}

module.exports = User;
