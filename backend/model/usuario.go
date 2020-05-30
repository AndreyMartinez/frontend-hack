package model

import (
	//"gopkg.in/mgo.v2/bson"
)

// Usuario - Model
type Usuario struct {
//	ID         bson.ObjectId `bson:"_id" json:"id"`
	Name      string  `json:"nombre"`
}

// ShoppingID - for request
type UsuarioID struct {
//	ID         bson.ObjectId `bson:"_id" json:"id"`

}
