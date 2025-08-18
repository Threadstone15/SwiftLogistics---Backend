export function isEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
}

export function isValidNIC(nic: string): boolean {
  // Sri Lankan NIC validation (basic)
  const nicRegex = /^(\d{9}[vVxX]|\d{12})$/;
  return nicRegex.test(nic);
}

export function isValidVehicleReg(vehicleReg: string): boolean {
  // Sri Lankan vehicle registration validation (basic)
  const regRegex = /^[A-Z]{2,3}-\d{4}$/;
  return regRegex.test(vehicleReg);
}
