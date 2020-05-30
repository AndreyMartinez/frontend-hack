package model

import (
	//"gopkg.in/mgo.v2/bson"
)

// Usuario - Model
type Usuario struct {
//	ID         bson.ObjectId `bson:"_id" json:"id"`
	Name      string  `json:"nombre"`
	Email     string  `json:"email"`
	Clave     string  `json:"clave"`
	Rol     string  `json:"rol"`
	Telefono string `json:"telefono"`
}

type Reciclaje struct {
	//	ID         bson.ObjectId `bson:"_id" json:"id"`
		Tipo      string  `json:"tipo"`
		User_id     string  `json:"user_id"`
		Latitud    string  `json:"latitud"`
		Longitud     string  `json:"longitud"`
		Fecha string `json:"fecha"`
	}

//  - for request
type UsuarioID struct {
//	ID         bson.ObjectId `bson:"_id" json:"id"`

}
