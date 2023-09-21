const express=require('express');
const router=express.Router();
const dbConnection=require('../db');
const path=require('path');
const app=express();
const verifyToken=require('../middleware/cookie-validation.js');
const formidable=require('formidable');
const fs=require('fs');
const generateId=require('../utils/generateId');

router.use((req, res, next)=>{
    next();
})

const getOrderStatus=(status, result)=>{
        
    return active=result.filter(orders=>
        orders.status==status);
}

router.get("/admin", verifyToken, (req, res)=>{

    switch(statusCode){

        case 200:

            if(tokenInfo.role==="Admin"){
                const username=`${tokenInfo.firstName} ${tokenInfo.lastName}`
            
                const allOrders=`SELECT orders.*, first_name, last_name FROM orders INNER JOIN users ON orders.created_by=uuid`;
                
                dbConnection.query(allOrders, (err, result)=>{
    
                    if(err){
                        console.log(err);
                    }
    
                    const orders={
                        username:username,
                        totalOrders:result.length,
                        allActiveOrders:getOrderStatus('Active', result).length,
                        allCancelledOrders:getOrderStatus('Cancelled', result).length,
                        allCompletedOrders:getOrderStatus('Completed', result).length,
                        allOrders:result.length==0?[]:result
                    }
    
                    res.send(orders);
    
                });
            }else{
                return res.sendStatus(401);
            }

            break;

        case 401:
            res.sendStatus(401);

            break; 

        case 403:
            res.sendStatus(403);

            break;
    }
})

router.get("/all", verifyToken, (req, res)=>{ 

    switch(statusCode){

        case 200:
            const getAllOrder=`SELECT orders.id, order_id,subject, status, date_deadline, first_name,last_name FROM orders RIGHT JOIN users ON orders.created_by=uuid WHERE uuid=${tokenInfo.uuid}`;

            dbConnection.query(getAllOrder, (err, result)=>{
        
                if(err){
                    console.log(err);
                }
                
                let userInfo={
                    name:`${result[0].first_name} ${result[0].last_name}`, 
                    allOrders:result[0].id==null?0:result.length,
                    activeOrders:getOrderStatus("Active", result).length,
                    cancelledOrders:getOrderStatus("Cancelled", result).length,
                    completedOrders:getOrderStatus("Completed", result).length,
                    orders:result[0].id==null?[]:result
                }
        
                res.send(userInfo);
            })

            break;
        
        case 401:
            res.sendStatus(401);
    
            break;
    
        case 403:
            res.sendStatus(403);
    
            break;
    }
});

router.post("/new", verifyToken, (req, res)=>{

    switch(statusCode){
        case 200:
            
            const form=new formidable.IncomingForm();

            const rootPath=(path.dirname(__dirname));

            form.parse(req, (err, fields, files)=>{

                if(err){
                    console.log(err);
                }

                if(files.file){
                    const file=files.file[0];
                
                    const oldPath=file.filepath;
    
                    const newPath=`${path.join(rootPath, "public", "files")}/${file.originalFilename}`;
    
                    let fileData=fs.readFileSync(oldPath);

                    fs.writeFile(newPath, fileData, (err)=>{
                        if(err){
                            console.log(err);
                        }
    
                    });
                }

                const {gradeLevel, subject, instructions, pagesOrwords, amount, deadline, time, fileName, sources, style}=fields;

                let orderId=generateId(100000000);

                let status='Active';

                let createdBy=tokenInfo.uuid;

                let file;

                files.file?file=fileName[0]:''

                const orderDetails=[
                    orderId,
                    createdBy,
                    subject[0],
                    gradeLevel[0],
                    style[0],
                    sources[0],
                    file,
                    instructions[0],
                    pagesOrwords[0],
                    amount[0],
                    deadline[0],
                    time[0],
                    status
                ]

                const createOrder="INSERT INTO orders (order_id, created_by, subject, level, ref_style, sources, file, instructions, words_or_pages, amount, date_deadline, time_deadline, status) VALUES (?)";

                dbConnection.query(createOrder, [orderDetails], (err)=>{

                    if(err){
                        console.log(err);
                    }

                    res.sendStatus(200);
                });
            })
            break;

        case 401:
            res.sendStatus(401);

            break;

        case 403:
            res.sendStatus(403); 

            break;
        
    }

} );

router.post("/revision", verifyToken, (req, res)=>{

    switch(statusCode){

        case 200:
            const {orderId, modificationType, modificationReason}=req.body;

            let modification_id=generateId(100000000);
            let order_id=orderId;
            let type=modificationType;
            let reason=modificationReason

            let orderModifications=[
                modification_id,
                order_id,
                type,
                reason
            ];

            const modifyOrder=`INSERT INTO orderModification (modification_id, order_id, modification_type, reason) VALUES (?)`;

            dbConnection.query(modifyOrder, [orderModifications], (err, result)=>{

                if(err){
                    console.log(err);
                }else{
                    res.sendStatus(200);
                }

                
            })

            break;

        case 401:
            res.sendStatus(401);

            break;

        case 403:
            res.sendStatus(403);

            break;
    }
  
})

router.post("/cancel-order", verifyToken, (req, res)=>{


    switch(statusCode){

        case 200:

            res.sendStatus(200)

            break;

        case 401:
            res.sendStatus(401);

            break;

        case 403:
            res.sendStatus(403);

            break;
    }

});

module.exports=router;