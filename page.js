'use client'

import {firestore} from '@/firebase'
import {storage} from '@/firebase'
import React, { useEffect, useState } from 'react'
import { collection, getDocs, getDoc, setDoc, deleteDoc, query, doc } from "firebase/firestore"; 
import { Box, Button, Stack, Typography, Modal, TextField } from '@mui/material';
import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage';

const style = { // style used in modal
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};



export default function Home() {


  
  const [openAdd, setOpenAdd] = useState(false); // handles and functionality associated to MODAL
  const handleOpenAdd = () => setOpenAdd(true);
  const handleCloseAdd = () => setOpenAdd(false);

  const [openDelete, setOpenDelete] = useState(false); 
  const handleOpenDelete = () => setOpenDelete(true);
  const handleCloseDelete = () => setOpenDelete(false);

  const [inventory,setInventory] = useState([])
  const [itemName,setItemName] = useState('')
  const [imageUpload,setImageUpload] = useState(null)
  const [imageList, setImageList] = useState({})



  // update's inventory that is to be displayed from database
  const updateInventory = async () => {  
    try{
      const snapshot = query(collection(firestore,'pantry'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    
    docs.forEach((doc)=>{
      inventoryList.push({
        name: doc.id,
        ...doc.data()
      })
    })

    setInventory(inventoryList)
    console.log(inventoryList)
    } catch (error){
      if (error.message.includes('offline')) {
        console.error("Client is offline. Retrying in 5 seconds...");
        setTimeout(updateInventory, 5000); // Retry after 5 seconds
      } else {
        console.error("Error fetching inventory: ", error);
      }
    }
  }

  // remove item from inventory
  /*
    to remove an item we first have to read it and then call the deleteDoc on the read doc we just did 
  */
  const removeItem = async (item) => { 
    const docRef = doc(collection(firestore,'pantry'),item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
      const {quantity} = docSnap.data()

      if(quantity===1){
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, {quantity: quantity-1})
      }
    }
    await updateInventory()
  }

  // add item to inventory
  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
      const {quantity} = docSnap.data()  
      await setDoc(docRef, {quantity: quantity + 1}) //if exist then add
    } else {
      await setDoc(docRef,{quantity: 1}) // else set to 1
    }
    await updateInventory()
  }

  //uploading an image to the pantry
  const uploadImage = (itemName) => {
    if(imageUpload==null) return;

    const imageRef = ref(storage, `${itemName}/${imageUpload.name}`);

    uploadBytes(imageRef, imageUpload).then(()=>{
      alert("image uploaded")
      //fetchImages()
    })

  }

  // to get images from the firestore
  const fetchImages = async () => {
    const newImageList = {};
    for (const item of inventory) {
      const itemName = item.name;
      const itemRef = ref(storage, itemName);
      try {
        const itemFiles = await listAll(itemRef);
        if (itemFiles.items.length > 0) {
          //const url = await getDownloadURL(itemFiles.items[0]);
          const urls = await Promise.all(itemFiles.items.map(fileRef => getDownloadURL(fileRef)));
          newImageList[itemName] = urls;
        }
      } catch (error) {
        console.error(`Error fetching image for ${itemName}:`, error);
      }
    }
    setImageList(newImageList);
  };
  

  // to render everytime something changes in inventory database
  useEffect(()=>{
    updateInventory()
  }, [])

  useEffect(() => {
    if (inventory.length > 0) {
      fetchImages();
    }
  }, [inventory])

  
  return (
    
    <Box          // parent box-component containing everything in it
      height="100%"
      width="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      >
    
        <Box          // main heading box
          height="100px"
          width="50%"
          mt={20}
          justifyContent={'center'}
          display="flex"
          alignItems="center"
          p={4}
          sx={{ border: '2px solid grey' }}
        >
          <Typography 
            variant='h3' 
            component='main-heading'
          >
            My Pantry List
          </Typography>
        </Box>


        <Box          // Box containing items list
          height="300px" 
          sx={{ width: '40%' }}
          mt={4}
          overflow={'scroll'}
          border={'2px solid grey'}
          borderRadius={2}
        >
          <Stack 
            direction="column"
            alignItems="center"
            spacing={3}
            p={3}
          >
            {
              inventory.map(({name,quantity}) => (
                <Box
                  key={name}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between" 
                  
                >
                  <Typography 
                    p={2}
                    bgcolor={'#87CEEB'}
                    textAlign={'center'}
                    width={'100%'}
                    borderRadius={3}
                  >
                    {name}
                  </Typography>   
                    
                  <Typography
                      p={2}
                      bgcolor={'#87CEEB'}
                      textAlign={'center'}
                      width={'100%'}
                      borderRadius={3}
                  >
                    {quantity}
                  </Typography>

                  <Button
                    variant='contained'
                    onClick={
                      ()=> {
                        removeItem(name)
                      }
                    }
                  >
                    remove
                  </Button>
                  <Button
                    variant='contained'
                    onClick={
                      ()=> {
                        addItem(name)
                      }
                    }
                  >
                    Add
                  </Button>
                  <Stack direction="column">
                    <input 
                      type="file" 
                      onChange={(e)=> setImageUpload(e.target.files[0])} 
                    
                    />
                    <button 
                      onClick={() => uploadImage(name)}

                    >
                      upload
                    </button>
                  </Stack>
                  
                  
                  
                </Box>

                
              ))
            }
          </Stack>
        </Box>

        <Box           // Box containing buttons for add and remove
          height="40px" 
          sx={{ width: '40%' }}
          mt={7}
        
        >
          <Stack direction={'row'} spacing={4} justifyContent={'center'}> 
            <Button // add item button
              onClick={handleOpenAdd}
              variant='contained'
            >
              Add
            </Button>
            
            <Modal // add item modal
              open={openAdd}
              onClose={handleCloseAdd}
            >
              <Box 
                sx={style}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Add New Item
                </Typography>

                <TextField
                  label="item name" 
                  variant="outlined"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}  
                />
                  
                <Box  
                  mt={2}
                >
                  <Button 
                    variant='contained'
                    onClick={()=>{
                        addItem(itemName)
                        setItemName('')
                        handleCloseAdd()
                      }
                    }
                    
                  >
                     Add item
                  </Button>
                </Box>
                
              </Box>
            </Modal>
          


            <Button
              onClick={handleOpenDelete}
              variant='contained'
            >
              Delete
            </Button>
            
            <Modal // delete item modal
              open={openDelete}
              onClose={handleCloseDelete}
            >
              <Box 
                sx={style}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Delete an existing item
                </Typography>

                <TextField
                  label="item name" 
                  variant="outlined"/>
                
                <Box
                  mt={2}
                >
                  <Button variant='contained'> Delete item</Button>
                </Box>
                
              </Box>
            </Modal>
          

          </Stack>
        </Box>
    </Box>
  );
}
