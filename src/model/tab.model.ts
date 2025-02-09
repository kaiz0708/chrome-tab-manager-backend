/** @format */
import { Entity, Property, ManyToOne } from "@mikro-orm/core";
import { DefaultModel } from "../common/DefaultSQL";
import { Collections } from "./collections.model";
type TCollections = Collections;

@Entity()
export class Tab extends DefaultModel {
   @Property({ nullable: true })
   title!: string;

   @Property({ nullable: true })
   url!: string;

   @Property({ type: "longtext", nullable: true })
   favIconUrl!: string;

   @Property({ nullable: true })
   position!: number;

   @ManyToOne(() => Collections)
   collection!: TCollections;
}

export interface TypeTab extends Partial<Omit<Tab, "collection">> {
   collection: number;
}
