package connection

import (
	"context"
	"fmt"
	"log"
  //	"gopkg.in/mgo.v2/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"github.com/candrea/backend/model"
)

type Connection interface {
	ExecuteConnection() *mongo.Client
	InsertUser(model.Usuario) error
}	


func ExecuteConnection() *mongo.Client {
	clientOpts := options.Client().ApplyURI("mongodb+srv://db:recycler@cluster0-p974z.azure.mongodb.net/test?retryWrites=true&w=majority",)
	client, err := mongo.Connect(context.TODO(), clientOpts)
	if err != nil {
		log.Fatal(err)
	}

	// Check the connections
	err = client.Ping(context.TODO(), nil)
	if err != nil {
		log.Fatal(err)
	}
    
	fmt.Println("Congratulations, you're already connected to MongoDB!")

	//collection := client.Database("reciclaje").Collection("usuarios")
	/*user := model.UsuarioID{bson.NewObjectId()}
	 good,err := collection.InsertOne(context.TODO(),user )
	 fmt.Println(good)*/
	 return client
	}

	func InsertUser (usuario model.Usuario) error {
		fmt.Println(usuario)
		 client := ExecuteConnection()
		//usuario.ID = bson.NewObjectId()
		collection := client.Database("reciclaje").Collection("usuarios")
		good,err := collection.InsertOne(context.TODO(),usuario )
		if err != nil {
			log.Fatal(err)
		}
	 fmt.Println(good)
	 return nil
	}
		

//}