// fetch all books
function fetchBooks() {
    return fetch('http://localhost:3000/books')
    .then (resp => resp.json())
}

// fetch all users
function fetchUsers() {
    return fetch('http://localhost:3000/users')
    .then (resp => resp.json())
}

// render books
const listBooks = document.querySelector('div#list-panel ul#list')
fetchBooks().then(booksArray => {
    return booksArray.map(function(book) {
        const oneBook = document.createElement('li')

        oneBook.dataset.id = book.id
        oneBook.textContent = book.title

        listBooks.appendChild(oneBook)
    })
})

// render book show page when book title is clicked
const showPanel = document.querySelector('div#show-panel')
function currentUser() {
    return fetchUsers().then(usersArray => usersArray.find(user => user.id === 1))
}
function currentBook(id) { 
    return fetchBooks().then(booksArray => booksArray.find(book => book.id == id))
}

function showBook(bookId) {
    // find matching pup Object
    fetchBooks().then(booksArray => { return booksArray.find(book => book.id == bookId) }) // need to use "==" bc comparing num and string
    // update show panel
    .then(book => {
        debugger
        showPanel.dataset.id = book.id
        showPanel.innerHTML = `
            <img src=${book.img_url} alt=${book.name}>
            <h2>${book.title}</h2>
            <h3>${book.subtitle}</h3>
            <h3>${book.author}</h3>
            <p>${book.description}</p>
            <ul id="user-likes">Users who liked this book:
            </ul>
            <button>${book.users.find(user => user.id === 1) ? "UNLIKE" : "LIKE"}</button>
            
        `
        const userLikesList = showPanel.querySelector('ul#user-likes')

        book.users.map(user => {
            const userElt = document.createElement('li')
            userElt.dataset.id = user.id
            userElt.textContent = user.username

            userLikesList.appendChild(userElt)
        })
    })
}

listBooks.addEventListener('click', function(event) {
    if (event.target.matches('li')) {
        const bookId = event.target.dataset.id
        showBook(bookId)
    }
})

// toggle like/unlike
showPanel.addEventListener('click', function(event) {
    if (event.target.matches('button')) {
        const button = showPanel.querySelector('button')
        let likeStatus = button.textContent
        let userLike;
        
        if (likeStatus === "LIKE") {
            button.textContent = "UNLIKE"
            userLike = true
        } else if (likeStatus === "UNLIKE") {
            button.textContent = "LIKE"
            userLike = false
        }

        const userLikesList = showPanel.querySelector('ul#user-likes')
        if (userLike) {
            currentUser().then(currentUser => {
                const newLike = document.createElement('li')
                newLike.dataset.id = currentUser.id
                newLike.textContent = currentUser.username
    
                userLikesList.appendChild(newLike)

                currentBook(showPanel.dataset.id).then(currentBook => {
                    fetch(`http://localhost:3000/books/${showPanel.dataset.id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ users: [...currentBook.users, currentUser] })
                    })
                })
            })
        } else {
            currentUser().then(currentUser => {
                const currentUserLike = userLikesList.querySelector(`[data-id='${currentUser.id}']`)
    
                currentUserLike.remove()

                currentBook(showPanel.dataset.id).then(currentBook => {
                    fetch(`http://localhost:3000/books/${showPanel.dataset.id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ users: removeUserLike(currentBook.users, currentUser) })
                    })
                })
            })
        }
    }
})

function removeUserLike(bookUserLikesArray, currentUser) { 
    
    return bookUserLikesArray.filter(function(user){ 
        return user.id != currentUser.id; 
    });
}
