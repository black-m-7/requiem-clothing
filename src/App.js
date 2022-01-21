import './App.css';
import logo from './assets/logo.png'
import image1 from './assets/1.jpg'
import boxLogo from './assets/box-logo.png'
import logoV2 from './assets/logo-v2.png'
import mercurial from './assets/mercurial.png'
import { useState, useEffect } from 'react'
import { 
  BrowserRouter,
  Routes,
  Route,
  Link } from 'react-router-dom'
import { 
  AppBar,
  Button,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Container,
  Modal,
  Input,
  TextField,
  Typography,
  Toolbar } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { AddIcon } from '@mui/icons-material';
import { auth, db, storage } from './firebase'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc, query, getDocs } from 'firebase/firestore'


const theme = createTheme({
  palette: {
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#DA0000',
    },
    text: {
      primary: '#000000',
      secondary: '#9D9D9D',
    },
    info: {
      main: '#FFFFFF'
    }
  }
})
const pages = ['home', 'shop', 'lookbook']

function App() {
  const cart = JSON.parse(localStorage.getItem('cart')) || []

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home cartCount={cart.length}/>}/>
            <Route path="/shop" element={<Shop cartCount={cart.length}/>}/>
            <Route path="/lookbook" element={<Lookbook cartCount={cart.length}/>}/>
            <Route path="/cart" element={<Cart/>}/>
            <Route path="/checkout" element={<Checkout/>}/>
            <Route path="/admin" element={<Admin/>}/>
          </Routes>
        </BrowserRouter>
        
      </div>
    </ThemeProvider>
  );
}

function Admin() {
  const [user, setUser] = useState(null)
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("")
  const [productName, setProductName] = useState("")
  const [productCollection, setProductCollection] = useState("")
  const [productPrice, setProductPrice] = useState("")
  const [image, setImage] = useState(null)
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
  }
  const inputStyle = {
    mx: 4,
    my:2
  }

  const onUploadImage = (e) => {
    const reader = new FileReader()
    let file = e.target.files[0]

    if (file) {
      reader.onload = () => {
        if(reader.readyState === 2) {
          setImage(file)
        }
      }
      reader.readAsDataURL(e.target.files[0]);
    } else {
      setImage(null)
    }
  }

  const uploadToFirebase = () => {
    if (image && productName && parseFloat(productPrice) && productCollection) {
      const storageRef = ref(storage, `/requiem-clothing/shop/${image.name}`)
      uploadBytes(storageRef, image).then((snapshot) => {
        getDownloadURL(ref(storage, `/requiem-clothing/shop/${image.name}`))
          .then((url) => {
            setImageUrl(url)
            uploadToFirestore()
            alert('Product added!')
          })
      })
    } else {
      alert('Please answer all fields.')
    }
  }

  const uploadToFirestore = async () => {
    await addDoc(collection(db, 'shop'), {
      name: productName,
      collection: productCollection,
      price: parseFloat(productPrice),
      imageUrl: imageUrl
    })
  }

  return (
    <>
      {!user ?
        <SignIn onSignIn={setUser}/> :
        (<>
          <Container sx={{m: 'auto', my:8, display:'flex'}}>
            <Typography variant='h5'>Add product</Typography>
            <Button variant='contained' sx={{mx:2}} onClick={handleOpen}>+</Button>
            <Modal
              open={open}
              onClose={handleClose}>
                <Box sx={style}>
                  <TextField required value={productName} onChange={(e) => {setProductName(e.target.value)}} sx={inputStyle} label="Product Name" variant="filled"/>
                  <TextField required value={productCollection} onChange={(e) => {setProductCollection(e.target.value)}} sx={inputStyle} label="Product Collection" variant="filled"/>
                  <TextField required value={productPrice} onChange={(e) => {setProductPrice(e.target.value)}} sx={inputStyle} label="Product Price" variant="filled"/>
                  <Input required sx={{my:3}} type='file' onChange={onUploadImage}></Input>
                  <Button variant='contained' sx={{m:2, mx:4}} onClick={uploadToFirebase}>ADD</Button>
                </Box>
            </Modal>
          </Container>
        </>)}
    </>
  )
}

function SignIn(props) {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider()
    signInWithPopup(auth, provider)
      .then((res) => {
        props.onSignIn(res.user)
      })
  }

  return (
    <Button onClick={signInWithGoogle} variant='contained' size='large' sx={{ m:4 }}>Sign in with Google</Button>
  )
}

function HeaderNav(props) {
  const { cartCount, active } = props
  return (
    <>
      <AppBar sx={{ opacity: 0.8, boxShadow: '0 2px 10px black' }}>
        <Toolbar>
          <Box sx={{ flexGrow:1, mx:2 }}>
            <img src={logo} alt="REQUIEM Collective" width="50px"/>
          </Box>
          <Box sx={{
            mx:2,
              display: {
                xs: 'none',
                md: 'flex' 
              },
              justifyContent: 'flex-end',
            }}>
            {pages.map((page) => {
              const color = active === page ? '#DA0000' : '#FFFFFF'
              return (
                <Container key={page} sx={{mx:0.5}}>
                  <Link to={ page === 'home' ? '/' : `/${page}`}
                        style={{color: color, textTransform: "capitalize"}}>{page}</Link>
                </Container>)
            })}
            <Link to="/cart" style={{color: '#ffffff'}}>{`Cart(${cartCount})`}</Link>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar/>
    </>
  )
}

function Footer() {}

function Home(props) {
  const {cartCount} = props
  return (
    <div>
      <HeaderNav cartCount={cartCount} active="home"/>
      <Container sx={{ mt:'40vh' }}>
        <img className="bg" key={0} id="one" src={image1} alt="test"/>
        <Typography variant="h2" sx={{ fontWeight:'bold', position:'relative', color:'#FFFFFF', filter:'drop-shadow(4px 6px 10px black)' }}>be remembered.</Typography>
        <Typography variant="h1" sx={{ fontWeight:'bold', position:'relative', color:'secondary.main', filter:'drop-shadow(4px 6px 10px black)'}}>choose your requiem.</Typography>
        <Button variant='outlined' size='large' sx={{ my:4 }} color='info'><Typography variant="h6"><Link to='/shop' style={{ color:'#FFFFFF'}}>SHOP NOW</Link></Typography></Button>
      </Container>
    </div>
  )
}

function Shop(props) {
  const { cartCount } = props
  const [newCart, setNewCart] = useState([])
  const [products, setProducts] = useState([])

  useEffect(() => {
    const getProducts = async () => {
      const querySnapshot = await getDocs(collection(db, 'shop'))
      setProducts(querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })))
    }
    getProducts()
  }, [products]);
  

  return (
    <>
      <HeaderNav cartCount={cartCount} active="shop"/>
      <Container sx={{ display:'flex', justifyContent:'center', my:6, flexWrap:'wrap'}}>
        {products.map(product => {
          return <Card sx={{ maxWidth:345, m:2, width:'100%', borderRadius:0}} key={product.id}>
            <CardActionArea>
              <CardMedia
                component='img'
                height='350'
                image={product.imageUrl}
                alt={product.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {product.name}
                </Typography>
                <Typography variant="body2">
                  P {product.price}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        })}
      </Container>    
    </>
  )
}

function Product() {}

function Cart() {
  return (
    <div>
      Cart
    </div>
  )
}

function Checkout() {
  return (
    <div>
      Checkout
    </div>
  )
}

function Lookbook(props) {
  const { cartCount } = props
  return (
    <>
      <HeaderNav cartCount={cartCount} active="lookbook"/>
      <Container>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus pretium accumsan felis, id sagittis turpis tristique dignissim. Suspendisse iaculis cursus tortor, eget interdum mauris tincidunt eu. Etiam suscipit finibus libero. Donec dictum nibh arcu, ac fermentum nibh auctor eget. Integer tristique, nibh eu ornare placerat, urna quam fermentum turpis, non imperdiet arcu diam vel ex. In hac habitasse platea dictumst. Curabitur a varius augue.
        </p>
        <p>
          Morbi nec semper dui. Mauris luctus suscipit varius. Nulla semper cursus neque vitae interdum. Vestibulum blandit risus et eros elementum finibus. Morbi in sapien scelerisque ante blandit fringilla et sit amet massa. Aenean eu efficitur nisl. Morbi sodales diam eget nunc ullamcorper dapibus. Vestibulum maximus risus sit amet sem consectetur, faucibus dapibus quam viverra. Mauris a consequat tortor. Praesent elementum velit non ligula aliquam pharetra. In eget dictum velit. Nunc interdum urna et turpis vestibulum, eget vestibulum nisi auctor.
        </p>
        <p>
          Praesent hendrerit ex elit, ac ultricies augue fringilla quis. Aliquam erat volutpat. Duis dictum justo ullamcorper ligula cursus, eget euismod felis interdum. Ut ipsum urna, egestas in erat at, pulvinar tempor neque. Etiam pretium, leo ac suscipit consequat, mi libero pretium turpis, in tempus nibh quam at est. Nunc a fringilla mi, sit amet consequat tellus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Maecenas luctus ligula ac enim accumsan scelerisque. Nullam vitae tortor ut lacus hendrerit faucibus nec a dolor. Nullam a neque sit amet ipsum porttitor egestas et nec nunc. Pellentesque bibendum ultricies nisi. Quisque dolor neque, tristique at tincidunt et, ornare quis urna. Nam maximus ipsum eu lacinia volutpat. Interdum et malesuada fames ac ante ipsum primis in faucibus.
        </p>
        <p>
          Donec eu tortor gravida, tincidunt tortor et, luctus tortor. Aliquam eu posuere sem. Sed commodo porta arcu, nec fringilla lorem aliquam ac. Cras at neque placerat justo euismod pretium ac quis lacus. Sed euismod malesuada tortor sit amet auctor. Donec fringilla enim orci, pharetra fringilla arcu vestibulum vel. Etiam tincidunt, risus ut pellentesque ultricies, turpis risus bibendum libero, a lacinia diam dolor vel leo. Nulla non scelerisque quam. Proin lacus nulla, gravida ut porttitor vel, porta in magna. Nam blandit sed tellus non maximus. Phasellus aliquet vestibulum arcu eu condimentum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Nunc nec erat mattis, viverra dolor eu, congue risus.
        </p>
        <p>
          Proin dignissim lacinia viverra. Vestibulum eget dictum orci, in gravida justo. Donec non dolor quis magna maximus lacinia. Morbi quis placerat erat. Etiam vulputate felis nisl, ut semper velit consequat eu. Aenean malesuada mauris id diam malesuada, vitae sollicitudin enim congue. Proin iaculis vestibulum ex at viverra. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin in dui tempor, ultricies lacus sit amet, pretium mauris. Nullam quis feugiat augue. Nam iaculis, odio quis fermentum consectetur, ante ex pharetra orci, sed posuere ligula mauris et dui. Sed ut sagittis dui, vitae venenatis felis. Maecenas interdum mauris a tincidunt ultricies. Sed ante magna, vehicula sit amet mattis id, mollis sit amet metus. Nunc tincidunt metus quis neque aliquam ultrices. Aliquam ac nisi ullamcorper, aliquam nibh a, gravida lacus.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus pretium accumsan felis, id sagittis turpis tristique dignissim. Suspendisse iaculis cursus tortor, eget interdum mauris tincidunt eu. Etiam suscipit finibus libero. Donec dictum nibh arcu, ac fermentum nibh auctor eget. Integer tristique, nibh eu ornare placerat, urna quam fermentum turpis, non imperdiet arcu diam vel ex. In hac habitasse platea dictumst. Curabitur a varius augue.
        </p>
        <p>
          Morbi nec semper dui. Mauris luctus suscipit varius. Nulla semper cursus neque vitae interdum. Vestibulum blandit risus et eros elementum finibus. Morbi in sapien scelerisque ante blandit fringilla et sit amet massa. Aenean eu efficitur nisl. Morbi sodales diam eget nunc ullamcorper dapibus. Vestibulum maximus risus sit amet sem consectetur, faucibus dapibus quam viverra. Mauris a consequat tortor. Praesent elementum velit non ligula aliquam pharetra. In eget dictum velit. Nunc interdum urna et turpis vestibulum, eget vestibulum nisi auctor.
        </p>
        <p>
          Praesent hendrerit ex elit, ac ultricies augue fringilla quis. Aliquam erat volutpat. Duis dictum justo ullamcorper ligula cursus, eget euismod felis interdum. Ut ipsum urna, egestas in erat at, pulvinar tempor neque. Etiam pretium, leo ac suscipit consequat, mi libero pretium turpis, in tempus nibh quam at est. Nunc a fringilla mi, sit amet consequat tellus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Maecenas luctus ligula ac enim accumsan scelerisque. Nullam vitae tortor ut lacus hendrerit faucibus nec a dolor. Nullam a neque sit amet ipsum porttitor egestas et nec nunc. Pellentesque bibendum ultricies nisi. Quisque dolor neque, tristique at tincidunt et, ornare quis urna. Nam maximus ipsum eu lacinia volutpat. Interdum et malesuada fames ac ante ipsum primis in faucibus.
        </p>
        <p>
          Donec eu tortor gravida, tincidunt tortor et, luctus tortor. Aliquam eu posuere sem. Sed commodo porta arcu, nec fringilla lorem aliquam ac. Cras at neque placerat justo euismod pretium ac quis lacus. Sed euismod malesuada tortor sit amet auctor. Donec fringilla enim orci, pharetra fringilla arcu vestibulum vel. Etiam tincidunt, risus ut pellentesque ultricies, turpis risus bibendum libero, a lacinia diam dolor vel leo. Nulla non scelerisque quam. Proin lacus nulla, gravida ut porttitor vel, porta in magna. Nam blandit sed tellus non maximus. Phasellus aliquet vestibulum arcu eu condimentum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Nunc nec erat mattis, viverra dolor eu, congue risus.
        </p>
        <p>
          Proin dignissim lacinia viverra. Vestibulum eget dictum orci, in gravida justo. Donec non dolor quis magna maximus lacinia. Morbi quis placerat erat. Etiam vulputate felis nisl, ut semper velit consequat eu. Aenean malesuada mauris id diam malesuada, vitae sollicitudin enim congue. Proin iaculis vestibulum ex at viverra. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin in dui tempor, ultricies lacus sit amet, pretium mauris. Nullam quis feugiat augue. Nam iaculis, odio quis fermentum consectetur, ante ex pharetra orci, sed posuere ligula mauris et dui. Sed ut sagittis dui, vitae venenatis felis. Maecenas interdum mauris a tincidunt ultricies. Sed ante magna, vehicula sit amet mattis id, mollis sit amet metus. Nunc tincidunt metus quis neque aliquam ultrices. Aliquam ac nisi ullamcorper, aliquam nibh a, gravida lacus.
        </p>
      </Container>
    </>
  )
}

export default App;
