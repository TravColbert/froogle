-- sqlite3 froogle.db
DROP TABLE `users_domains`;
DROP TABLE `categories`;
DROP TABLE `expenses`;
DROP TABLE `domains`;

CREATE TABLE `domains` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT, 
  `name` VARCHAR(255) NOT NULL UNIQUE, 
  `description` VARCHAR(255), 
  `appid` VARCHAR(255), 
  `createdAt` DATETIME NOT NULL, 
  `updatedAt` DATETIME NOT NULL, 
  `ownerId` INTEGER REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- CREATE TABLE `categories` (
--   `id` INTEGER PRIMARY KEY AUTOINCREMENT, 
--   `name` VARCHAR(255), 
--   `description` TEXT, 
--   `createdAt` DATETIME NOT NULL, 
--   `updatedAt` DATETIME NOT NULL, 
--   `domainId` INTEGER REFERENCES `domains` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
-- );

CREATE TABLE `expense_types` (
  `id` INTEGER PRIMARY KEY,
  `name` VARCHAR(255),
  `description` TEXT
);

INSERT INTO expense_types VALUES (0,'Cash','Cash, bank or debit card transactions. Anything straight out of your bank account');
INSERT INTO expense_types VALUES (1,'Credit','Credit card transactions that do not reflect on your bank account until paid');

CREATE TABLE `expenses` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT, 
  `expenseTypeId` INTEGER REFERENCES `expense_types` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  `date` DATETIME, 
  `amount` REAL, 
  `provider` VARCHAR(255), 
  `category` VARCHAR(255), 
  `note` VARCHAR(255), 
  `public` TINYINT(1) DEFAULT 0, 
  `createdAt` DATETIME NOT NULL, 
  `updatedAt` DATETIME NOT NULL, 
  `userId` INTEGER REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE, 
  `domainId` INTEGER REFERENCES `domains` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE `users_domains` (
  `userId` INTEGER REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  `domainId` INTEGER REFERENCES `domains` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  `createdAt` DATETIME NOT NULL, 
  `updatedAt` DATETIME NOT NULL, 
  PRIMARY KEY (`userId`,`domainId`)
);
