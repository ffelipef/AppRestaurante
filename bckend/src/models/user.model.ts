export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: 'customer' | 'admin' | 'kitchen';
}

export const users: User[] = [];
