/** @format */
import { Collection, EntityManager } from "@mikro-orm/mysql";
import { Group } from "../model/group.model";

export interface UserJWT {
   id: number;
   username: string;
   email: string;
   iat: number;
   exp: number;
   group: Group;
}

export interface Environment {
   Bindings: {
      SECRET: string;
   };
   Variables: {
      userJWT: UserJWT;
      em: EntityManager;
      passport: any;
   };
}
