export default function Page({params}:{params:{ test: [string]}}) {
    return <h1>Login Page! {params.test[0]}</h1> 
}