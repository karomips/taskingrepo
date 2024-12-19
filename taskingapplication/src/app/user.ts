export class Admin {
    public id: number;
    public admin_username: string;
    public password: string;

    constructor(id: number, admin_username: string, password: string) {
        this.id = id;
        this.admin_username = admin_username;
        this.password = password;
    }

    // You can add additional methods if necessary
    public displayAdmin(): string {
        return `Admin ID: ${this.id}, Admin_Username: ${this.admin_username}`;
    }
}
