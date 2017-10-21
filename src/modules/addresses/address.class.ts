import {
    prop
  } from 'typegoose';

export class Address {
    @prop()
    type?: string;

    @prop()
    line1?: string;

    @prop()
    line2?: string;

    @prop()
    line3?: string;

    @prop()
    line4?: string;

    @prop()
    line5?: string;    
}  
