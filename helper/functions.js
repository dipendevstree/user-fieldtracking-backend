"use strict";
const bcrypt = require("bcryptjs");
Object.defineProperty(exports, "__esModule", { value: true });

exports.randomSixDigit = exports.replaceNullToBlankString = void 0;

const randomSixDigit = () => {
  return Math.floor(100000 + Math.random() * 900000);
};
exports.randomSixDigit = randomSixDigit;
const randomFourDigits = () => {
  const randomArray = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const random1 = randomArray[Math.floor(Math.random() * randomArray.length)];
  const random2 = randomArray[Math.floor(Math.random() * randomArray.length)];
  const random3 = randomArray[Math.floor(Math.random() * randomArray.length)];
  const random4 = randomArray[Math.floor(Math.random() * randomArray.length)];
  const otp = random4 + random3 + random2 + random1;
  return otp;
};
exports.randomFourDigits = randomFourDigits;
const appendIfValid = (field, value) => {
  return value && value !== "undefined" ? { [field]: value } : {};
};
exports.appendIfValid = appendIfValid;
const replaceNullToBlankString = async (obj) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] == null) {
      obj[key] = "";
    }
  });
  return obj;
};
exports.groupPermissionsByModule = (permissions) => {
  const menuMap = new Map();

  permissions.forEach((item) => {
    const menu = item.organizationMenu;
    menuMap.set(menu.organizationMenuId, {
      organizationMenuId: menu.organizationMenuId,
      menuName: menu.menuName,
      menuKey: menu.menuKey,
      parentMenuId: menu.parentMenuId,
      add: item.add,
      edit: item.edit,
      viewOwn: item.viewOwn,
      viewGlobal: item.viewGlobal,
      delete: item.delete,
      children: [],
    });
  });

  // Step 2: Convert flat structure to nested menu/submenu
  const menuTree = [];

  menuMap.forEach((menu, id) => {
    if (menu.parentMenuId && menuMap.has(menu.parentMenuId)) {
      menuMap.get(menu.parentMenuId).children.push(menu);
    } else {
      menuTree.push(menu);
    }
  });
  return menuTree;
};
exports.replaceNullToBlankString = replaceNullToBlankString;

exports.decryptPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

exports.comparePassword = async (enteredPassword, dbPassword) => {
  return await bcrypt.compare(enteredPassword, dbPassword);
};
