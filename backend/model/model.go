package model

import (
	//"gopkg.in/mgo.v2/bson"
)

// Usuario - Model
type Usuario struct {
//	ID         bson.ObjectId `bson:"_id" json:"id"`
	Name      string  `bson:"nombre"   json:"nombre"`
	Email     string `bson:"email" json:"email"`
	Clave     string  `bson:"clave" json:"clave"`
	Rol     string  `bson:"rol" json:"rol"`
	Telefono string `bson:"telefono" bson:"telefono"`
}

type Reciclaje struct {
	//	ID         bson.ObjectId `bson:"_id" json:"id"`
	    Email     string  `bson:"email" json:"email"`
		Tipo      string  `bson:"tipo" json:"tipo"`
		User_id     string  `bson:"user_id" json:"user_id"`
		Latitud    string  `bson:"latitud" json:"latitud"`
		Longitud     string  `bson:"longitud" json:"longitud"`
		Fecha string `bson:"fecha" json:"fecha"`
	}

//  - for request
type UsuarioID struct {
//	ID         bson.ObjectId `bson:"_id" json:"id"`

}
