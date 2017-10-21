import {
    Ref,
    prop,
    arrayProp,
    Typegoose,
    ModelType,
    InstanceType,
    staticMethod,
    instanceMethod,
    pre,
    post,
    plugin,
  } from 'typegoose';

import { Address } from '../addresses/address.class';
import { Contact } from '../contacts/contact.class';

// tslint:disable-next-line:no-var-requires  
import * as paginate from "mongoose-paginate";

export interface PageinateResult<T> {
    docs: [InstanceType<T>];
    total?: number;
    limit?: number;
  }

@pre<GkClientType>('save', function(next) { // or @pre(this: Car, 'save', ...
  let currentDate = new Date();
  this.updatedAt = currentDate;
  if (!this.createdAt) {
  this.createdAt = currentDate;
  }
  next();  
})

@plugin(paginate)
export class GkClientType extends Typegoose {
    @prop({ required: true, minlength: 5, index: true })
    name: string;

    @prop({ required: true, minlength: 3, index: true, unique: true })
    clientDb: string;

    @arrayProp({ items: Address })
    addresses?: Address[];

    @arrayProp({ items: Contact })
    contacts?: Contact[];

    @arrayProp({ items: String })
    remarks?: string[];

    @arrayProp({ items: String })
    solutions?: string[];

    @prop()
    status1?: string;

    @prop()
    status2?: string;

    @prop()
    get status() {
      return `${this.status1} ${this.status2}`;
    }
    set status(status) {
      const split = status.split(' ');
      this.status1 = split[0];
      this.status2 = split[1];
    }

    @prop()
    createdAt: Date;

    @prop({ required: true, default: Date.now })
    updatedAt?: Date;

    @instanceMethod
    addAddress(this: InstanceType<GkClientType>, address: Partial<Address> = {}) {
      this.addresses.push(address);
  
      return this.save();
    }
    
    static paginate: (query, options) => Promise<PageinateResult<GkClientType>>;
    
}

export const model = new GkClientType().getModelForClass(GkClientType);