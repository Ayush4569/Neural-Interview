import bcrypt from "bcrypt";
export const hashPassword = async (password: string): Promise<string> => await bcrypt.hash(password, 10);