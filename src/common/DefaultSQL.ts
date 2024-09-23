/** @format */
import { PrimaryKey, Property } from "@mikro-orm/core";

export class DefaultModel {
   @PrimaryKey()
   id!: number;

   @Property({ type: Date })
   createdAt = new Date();

   @Property({ type: Date, onUpdate: () => new Date() })
   updatedAt = new Date();
}
