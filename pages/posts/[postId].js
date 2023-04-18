import { useRouter } from "next/router"

function Post({ post }) {
    const router = useRouter()

    // Even though with fallback set to true, next will generate pages for other paths not set at build time, it will do so at the first time that path is accessed hence the info to render the part below will not be available and may break our code which is a bad ux hence the if statement
    if (router.isFallback) { //i. if fallback is still true
        return <h1>Loading...</h1>  
    }
    // After fetching path, fallback will be set to false by next and this path will show
    return (
        <>
            <h2>
                {post.id} {post.title}
            </h2>
            <p>{post.body}</p>
        </>
    )
}

export default Post

// For routes with dynamic path parameter which we want to statically generate at build time, we must define also the getstaticpaths function which tells next which dynamic paths to statically generate at build time. This is because, without telling it, next will have alot of paths depending on the number of possible parameters (e.g in the case of 1ooposts, that is 100 possible routes with same html structure but different data due to different route parameters) and this leaves it confused as to what amount of work needs to be done at build time.
// Like the getstaticprops, this function also returns an object which contains a 'paths' key which will be an array of objects containing 'params' which is also an object containing each path parameter, in our case here - postId with a string value.. 
// It must also contain a second key called 'fallback' with possible values of false, true or blocking.
export async function getStaticPaths() { 
    return {
        // Generate path for only the first three at build time
        paths:[
            {
                params:{ postId:'1'}
            },
            {
                params:{ postId:'2'}
            },
            {
                params:{ postId:'3'}
            }
        ],
        // paths,
        fallback: true
    }
}


// The getstaticprops function accepts a parameter which by convention is called 'context'. This parameter is an object which we will destructure into params from which in our case we will get the post id we need to fetch.
export async function getStaticProps(context) {
    // Destructure parameter
    const { params } = context
    // make the API call
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${params.postId}`)
    // convert the response to json
    const data = await response.json()
    console.log(data)
    // Since our fallback in the getstaticpaths function is set to true, it means any path not not available on this part of the app will always return a blank page. e.g,say we have a db with 100posts and we statically generated pages for the first 5 at build time, the remaining 95 will be generated anytime they are visited but if we access /101 etc, it will just be a blank page. For better ux, we can tell next to display the 404 page instead.
    if(!data.id) { //i.e, if the returned data doesn't contain an id, then we are sure it is an empty response.
        return{
            notFound: true
        }
    }
    // return an object of object holding the fetched data in a props object.
    return {
        props:{
            post: data,
        },
    }
}