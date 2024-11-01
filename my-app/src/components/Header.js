import React from 'react'
import '../components.style/Header.css'
import img from '../images/img1.png'
export default function Header(){
    
    return (

        <div className='PKF-Header'>

            <div className="logo">
                <a href='https://www.pkf.pt/' title='PKF Portugal'>
                    <img src={img} alt='Footer Logo' className='imagemlogo'></img>
                </a>  
            </div>
            <h1>header de teste</h1>
            <div>
                
            </div>
        </div>
        
    )

}