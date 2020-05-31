package model

import (
	//"gopkg.in/mgo.v2/bson"
)

// Usuario - Model
type Usuario struct {

	
	Email     string `bson:"email" json:"email"`
	Clave     string  `bson:"clave" json:"clave"`
	Rol     string  `bson:"rol" json:"rol"`
	Telefono string `bson:"telefono" bson:"telefono"`
}
// Reciclaje - Model
type Reciclaje struct {
	
	    Email     string  `bson:"email" json:"email"`
		Tipo      string  `bson:"tipo" json:"tipo"`
		Descripcion string  `bson:"descripcion" json:"descripcion"`
		Latitud    string  `bson:"latitud" json:"latitud"`
		Longitud     string  `bson:"longitud" json:"longitud"`
		Fecha string `bson:"fecha" json:"fecha"`
	}

