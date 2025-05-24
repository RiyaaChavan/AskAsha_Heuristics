import React from "react";
import { BackgroundBeams } from "./BackgroundBeams";
import "./BackgroundBeamsDemo.css";
import {PlaceholdersAndVanishInput} from "./PlaceholdersAndVanishInput"

export function BackgroundBeamsDemo() {

    const placeholders = [
    "Fine me jobs in Mumbai for Data Science Roles?",
    "Help me prepare for my upcoming Interview",
    "I need a raise in my salary. How do i negotiate?",
    "Find me any upcoming seminars related to Cloud Engineering",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };
  
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submitted");
  };
  
  return (
    <div className="background-beams-demo">
      <BackgroundBeams />
    </div>
  );
}



 