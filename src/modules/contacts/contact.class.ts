import { prop } from 'typegoose';

export class Contact {
    @prop()
    title?: string;

    @prop()
    name?: string;

    @prop()
    phone?: string;

    @prop()
    email?: string;
}
