package connection

import (
	"context"
	"fmt"
	"log"
    "go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"github.com/candrea/backend/model"
)

type Connection interface {
	ExecuteConnection() *mongo.Client
	InsertUser(model.Usuario) error
	LoginUser(model.Usuario) model.Usuario
	InsertRecycle(model.Reciclaje) error
	Recycle() []*model.Reciclaje
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


	func LoginUser (usuario model.Usuario) model.Usuario {
		
		client := ExecuteConnection()
	   //usuario.ID = bson.NewObjectId()
	   collection := client.Database("reciclaje").Collection("usuarios")
	  err := collection.FindOne(context.TODO(), bson.M{"email":usuario.Email}).Decode(&usuario)
	  if err != nil {
		log.Fatal(err)
	}
	   fmt.Println(usuario,"Prueba")
	return usuario
   }

	func InsertRecycle  (reciclaje model.Reciclaje) error{
		client := ExecuteConnection()
		collection := client.Database("reciclaje").Collection("reciclaje")
		good,err := collection.InsertOne(context.TODO(),reciclaje )
		if err != nil {
			log.Fatal(err)
		}
	 fmt.Println(good)
	 return nil
	}
	 func Recycle() []*model.Reciclaje {
		client := ExecuteConnection()
		collection := client.Database("reciclaje").Collection("reciclaje")
		findOpts := options.Find()
		var results []*model.Reciclaje
		
		cur, err := collection.Find(context.TODO(), bson.D{{}}, findOpts)
		if err != nil {
			log.Fatal(err)
		}
		
		for cur.Next(context.TODO()) {			
			// create a value into which the single document can be decoded
			var s model.Reciclaje
			err := cur.Decode(&s)
			if err != nil {
				log.Fatal(err)
			}
		
			results = append(results, &s)
		}
		
		if err := cur.Err(); err != nil {
			log.Fatal(err)
		}
		
		
		cur.Close(context.TODO())
		fmt.Printf("Found multiple documents (array of pointers): %+v\n", results)
		return results
	 }		

//}