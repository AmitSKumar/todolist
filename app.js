
const express = require("express");
const mongoose= require('mongoose');
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect('mongodb+srv://amit_007:Lovely123@cluster0.twysk.mongodb.net/todolistDb?retryWrites=true&w=majority',{ useUnifiedTopology: true },{useNewUrlParser:true})

const itemsSchema = mongoose.Schema({name:String
});

// collection/model wheere we insert item
const Item = mongoose.model('Item',itemsSchema);

const item1=new Item({name:'Cook food'});
const item2=new Item({name:'take food'});
const item3=new Item({name:'eat food'});
const dafaulArray=[item1,item2,item3];

const listSchema ={
  name:String,
  items:[itemsSchema]
}

const List =mongoose.model('list',listSchema);

app.get("/", function(req, res) {
  Item.find((err,foundItems)=>{
    if(err){
  console.log(err);
    }
    else{
      if(foundItems.length===0){
        Item.insertMany(dafaulArray,(err)=>{
          if(err){
            console.log(err)
          }else{
            console.log("success");
            mongoose.connection.close();
          }
          })
          res.redirect('/')
      }else
        {
          res.render("list", {listTitle: 'Today', newListItems: foundItems});
        }
    }
  })
});
app.post('/delete',(req,res)=>{
  const listname = req.body.listname;
  const chekedItem = req.body.checkbox;
  if(listname==='Today'){
    Item.findByIdAndRemove(chekedItem,(err)=>{
      if(err){
        console.log(err)
      }else{
        res.redirect('/')
        console.log(chekedItem+ 'Deleted succesfully')
      }
    })
  }else{
    console.log(listname)
List.findOneAndUpdate({name:listname},{$pull:{items:{_id:chekedItem}}},
  function(err,foundItem) {
if(!err){
  res.redirect("/"+listname)
}
})
  }
  
})
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const item = new Item({name:itemName});
  const listitem =req.body.list;
  if(listitem==='Today'){
    res.redirect('/');
    item.save();
  }else{
    List.findOne({'name':listitem},function(err,foundItems){
      foundItems.items.push(item)
      foundItems.save();
      res.redirect('/'+listitem)
    })
  }
});

app.get("/:parameter", function(req,res){
const listItem =_.capitalize(req.params.parameter);

List.findOne({name:listItem},function(err,foundItem){
if(err){

}else{
  if(!foundItem){
    const list = new List({
      name:listItem,
      items:dafaulArray
    })
    list.save();
    res.redirect('/'+listItem)
  }else{
    res.render('list',{listTitle:foundItem.name , newListItems: foundItem.items})
  }
}
})

});

app.get("/about", function(req, res){
  res.render("about");

});
let port = process.env.PORT;
if(port == null || port == ""){
  port=3000;
}
app.listen(port, function() {
  console.log("Server started succefully");
});
