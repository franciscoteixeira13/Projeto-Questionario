import '../components.style/LoginSignup.css'
import React, { useState } from 'react';

export default function LoginSignup(){

  const [FormValues, setFormValues] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [inputData, setInputData] = useState('')

  const handleSubmit = async (event) => {

  event.preventDefault();

  const response = await fetch('http://localhost:3001/api/data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    
    body: JSON.stringify({ data: inputData }),
    
  });

  let dataToJSON = JSON.stringify({ data: inputData});

  //Insere a informação na lista 
  setFormValues([ ... FormValues, inputValue]);
  setInputValue([ ... inputValue])
  const responseData = await response.text();

  console.log(responseData);

    return (
        <div>

            <div class="container" >
                <a class="links" id="paracadastro"></a>
                <a class="links" id="paralogin"></a>
                
                <div class="content">      
                 
                  <div id="login">
                    <form method="post" action=""> 
                      <h1>Login</h1> 
                      <p> 
                        <label for="email_login">Email</label>
                        <input value ='' id="email_login" name="email_login" required="required" type="text" placeholder=""/>
                      </p>
                      
                      <p> 
                        <label for="senha_login">Password</label>
                        <input id="senha_login" name="senha_login" required="required" type="password" placeholder="" /> 
                      </p>
                      
                      <p> 
                        <input type="checkbox" name="keeplogged" id="keeplogged" value="" /> 
                        <label for="keeplogged"> Keep logged in</label>
                      </p>
                      
                      <p> 
                        <input type="submit" value="Login" /> 
                      </p>
                      
                      <p class="link">
                        Not registered?
                        <a href="#paracadastro">Sign up</a>
                      </p>
                    </form>
                  </div>

                 
                  <div id="cadastro">
                    <form method="post" action=""> 
                      <h1>Signup</h1> 
                      
                      <p> 
                        <label for="nome_cad">Name</label>
                        <input id="nome_cad" name="nome_cad" required="required" type="text" placeholder="" />
                      </p>
                      
                      <p> 
                        <label for="email_cad">Email</label>
                        <input id="email_cad" name="email_cad" required="required" type="email" placeholder=""/> 
                      </p>
                      
                      <p> 
                        <label for="senha_cad">Password</label>
                        <input id="senha_cad" name="senha_cad" required="required" type="password" placeholder=""/>
                      </p>
                      
                      <p> 
                        <input type="submit" value="Create Account"/> 
                      </p>
                      
                      <p class="link">  
                        Already registered?
                        <a href="#paralogin"> Go to login</a>
                      </p>
                    </form>
                  </div>
                </div>
              </div> 

        </div>
           
    
    )


};
}