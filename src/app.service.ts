import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `
	<title>Nest.js</title>
 	<link rel="icon" type="image/x-icon" href="https://nestjs.com/favicon.264d6486.ico">
	<style type="text/css">* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  font-family: sans-serif;
  color: #b1b1b1; }

body {
  height: 100vh;
  width: 100vw;
  overflow-x: hidden;
  background: #11101d; }

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 10vw; }

  .logo{
    width:100px;
    height: 100px;
  }

.head {
  font-size: 2em;
  margin-top: 4vh;
  width: 100%;
  text-align: center; }
  .head a {
    text-decoration: none;
    color: #33bbcf;
    position: relative; }
    .head a::before {
      width: 0;
      height: 2px;
      background: #33bbcf;
      position: absolute;
      content: '';
      bottom: -5px;
      transition: 200ms; }
    .head a:hover::before {
      width: 100%; }

.sub {
  font-size: 1.5em;
  margin-top: 1vh; }

.desc {
  margin-top: 3vh;
  width: 100%;
  text-align: center;
  font-size: 1.2em;
  line-height: 1.2em; }

.buttons {
  margin-top: 4vh;
  font-size: 1.2em; }
  .buttons .docu {
    border: 1px solid #33bbcf;
    border-radius: 50px;
    padding: 15px 0;
    background: #33bbcf;
    transition: 300ms ease-out; }
    .buttons .docu a {
      padding: 15px 30px;
      text-decoration: none;
      color: #111; }
    .buttons .docu:hover {
      background: transparent; }
      .buttons .docu:hover a {
        color: #b1b1b1; }
</style>
<div class='container'>
  <div class='logo'>
    <img src='https://docs.nestjs.com/assets/logo-small.svg' alt='nest' class='logo'/>
  </div>
  <div class='head'>
    <a href='https://nestjs.com' target='_blank'>Nest.js</a> Starter Template
  </div>
  <div class='sub'>
    At Replit
  </div>
  <div class='desc'>
    Nest (NestJS) is a framework for building efficient, scalable Node.js server-side applications. It uses progressive JavaScript, is built with and fully supports TypeScript (yet still enables developers to code in pure JavaScript) and combines elements of OOP (Object Oriented Programming), FP (Functional Programming), and FRP (Functional Reactive Programming).
  </div>
  <div class='buttons'>
  	<div class='docu'>
      <a href='https://docs.nestjs.com' target='_blank'>Documentation</a>
    </div>
  </div>
</div>`;
  }
}
