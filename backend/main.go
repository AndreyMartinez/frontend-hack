package main

import (
	"encoding/json"
	"net/http"
	"fmt"
	"github.com/reciclaje/model"
	"github.com/gin-gonic/gin"
	//"gopkg.in/mgo.v2/bson"
	"github.com/reciclaje/connection"
)

var prefixPath = "/api/reciclaje"

func InsertUserController (c *gin.Context){
	var usuario model.Usuario
	err := c.BindJSON(&usuario)
	if err != nil {
		c.Status(http.StatusBadRequest)
	}
	fmt.Println(usuario)
	//usuario.ID = bson.NewObjectId() 
	if err := connection.InsertUser(usuario);
	 err != nil {
	//respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	//respondWithJSON(w, http.StatusCreated, usuario)
}




func main() {
	r := gin.Default()
	r.POST("/api/register", InsertUserController)
	r.Run()
	
}

func respondWithError(w http.ResponseWriter, code int, message string) {
	respondWithJSON(w, code, map[string]string{"error": message})
}

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, _ := json.Marshal(payload)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(response)
}


