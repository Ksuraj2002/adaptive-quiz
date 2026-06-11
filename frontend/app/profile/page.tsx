"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdaptiveQuizEngine from "./ques_front";

import axios from "axios"

export default function ProfilePage() {

//  const [user,setUser] = useState<UserProfile | null>(null);
//  const [error, setError] = useState("");
 const router = useRouter();

 useEffect(()=> {
    console.log("Profile page loaded");
   const savedEmail = localStorage.getItem("loggedInEmail");

   if(!savedEmail){
     router.push("/");
   }

   

  //  console.log("Sending email:", savedEmail);

  //  axios.post("http://localhost:8000/api/user-profile",{email: savedEmail})
  //  .then((response) => {
  //    if(response.data.status === "success"){
  //      setUser(response.data.user);
  //    }
  //  })
  //  .catch((err) => {
  //    setError("Could not authenticate user data.")
  //  })

},[router]);

 
   return (
     <div>
       <h1>Welcome to Quiz platformwe</h1>
       <AdaptiveQuizEngine/>
     </div>
   );
 


}

