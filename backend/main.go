package main

import (
	//"encoding/json"
	"net/http"
	"fmt"
	"github.com/candrea/backend/model"
	"github.com/gin-gonic/gin"
	//"gopkg.in/mgo.v2/bson"
	"github.com/candrea/backend/connection"
	"github.com/gin-contrib/cors"
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
	
		return
	}
	
}


func LoginUserController (c *gin.Context){
	
	var usuario model.Usuario
	err := c.BindJSON(&usuario)
	if err != nil {
		c.Status(http.StatusBadRequest)
	}
	
	 user := connection.LoginUser(usuario);
	 fmt.Println(user)

	if user.Rol != "" {
		c.JSON(http.StatusOK, gin.H{"responseContent": user})
	}
	c.Status(http.StatusBadRequest)
	
	
	
	
}

func InsertRecycleController (c *gin.Context){
	
	var reciclaje model.Reciclaje
	err := c.BindJSON(&reciclaje)
	if err != nil {
		c.Status(http.StatusBadRequest)
	}
	fmt.Println(reciclaje)
	//usuario.ID = bson.NewObjectId() 
	
	if err := connection.InsertRecycle(reciclaje);
	 err != nil {
	
		return
	}
	
}

func RecycleController (c *gin.Context) {		
	
	reciclaje := connection.Recycle();
	if reciclaje != nil{
		c.JSON(http.StatusOK, gin.H{"responseContent": reciclaje})
	}
	if err := connection.Recycle();
	 err != nil {
	
		return
	}
	
	
}



func main() {
	r := gin.Default()

	r.Use(cors.Default())


	r.POST("/api/register", InsertUserController)
	r.POST("/api/recycle", InsertRecycleController)
	r.GET("/api/recycling", RecycleController)
	r.POST("/api/login",LoginUserController)
	r.Run()
	
}




