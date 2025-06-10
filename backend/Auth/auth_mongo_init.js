// MongoDB initialization script
db = db.getSiblingDB('banking_auth');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "status": 1 });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "createdAt": -1 });
db.users.createIndex({ "lastLogin": -1 });
db.users.createIndex({ "emailVerificationToken": 1 }, { sparse: true });
db.users.createIndex({ "passwordResetToken": 1 }, { sparse: true });

// Create a default admin user (remove in production)
if (db.users.countDocuments({ role: "admin" }) === 0) {
  db.users.insertOne({
    email: "admin@bankingapp.com",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6sMoFIj4B2", // password: Admin123!
    firstName: "System",
    lastName: "Administrator",
    phone: "+1234567890",
    role: "admin",
    status: "active",
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  print("Default admin user created: admin@bankingapp.com / Admin123!");
}

print("Database initialization completed!");