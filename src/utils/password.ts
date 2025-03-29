import bcrypt from 'bcrypt';

export const hashPassword = async (raw: string) => {
    try {
        return await bcrypt.hash(raw, 10);
    } catch (error) {
        return "";
    }
}

export const comparePassword = async (raw: string, hash: string): Promise<boolean> => {
    try {
        return await bcrypt.compare(raw, hash);
    } catch (error) {
        return false;
    }
}