'use strict'
// получаем ссылку на элемент с id="catalog", для вывода карточек товара
const catalog = document.getElementById('catalog')
// получаем ссылку на счетчик заказов в шапке
const headerCartCounter = document.getElementById('header-cart-counter')

let orderedSmartphoneCounter = 0 // количество товара в корзине (пока 0, потом пересчитаем)

// МЕТОДЫ РАБОТЫ С ЛОКАЛЬНЫМ ХРАНИЛИЩЕМ БРАУЗЕРА
// localStorage.clear() - очистить все хранилище
// localStorage.setItem("key", "value") - записать в хранилище по ключу "key" значение "value"
// localStorage.removeItem("key") - удалить из хранилища запись с ключом "key"

// создаем массив заказов (объекты, с названием и количеством)
let ordersList = [] /* {name: '', number: n} */

// пробуем получить данные из локального хранилища по ключу "orders"
const storageOrders = localStorage.getItem("orders")
if (storageOrders) { // если данные есть
    // преобразуем данные в массив ordersList
    ordersList = JSON.parse(storageOrders)
    // если есть объекты в массиве
    if (ordersList.length > 0) {
        // перебираем все объекты и обновляем число заказов в переменной orderedSmartphoneCounter
        for (let i = 0; i < ordersList.length; i++) {
            orderedSmartphoneCounter += ordersList[i].number
        }
    }
    // обновляем число заказов в корзине (выводим информацию в шапку сайта)
    headerCartCounter.innerText = orderedSmartphoneCounter
}

// определяем название HTML-файла (текущей страницы)
const pageName = getPageName()
// функция, возвращающая имя HTML-файла (текущей страницы)
function getPageName() {
    const URL = location.href.split('?')[0] // отсекаем параметры запроса (могут быть при переходе с рекламы)
    const htmlFileName = URL.split('/').pop().split('.')[0] // достаем текст из адреса между символами '/' и '.'
    return htmlFileName // возвращаем полученный текст (имя HTML-файла текущей страницы)
}

// функция обновления заказа в памяти программы и локального хранилища
function checkOrder( phoneBrandAndName, action = null ) {
    for (let i = 0; i < ordersList.length; i++) { // перебираем все что уже было заказано
        if (ordersList[i].name === phoneBrandAndName) { // ищем заказ с названием phoneBrandAndName

            if (action === '+') { // если это было добавление заказа
                ordersList[i].number++ // увеличиваем счетчик
                localStorage.setItem("orders", JSON.stringify(ordersList)) // обновляем хранилище
            }

            if (action === '-') { // если это было удаление заказа
                ordersList[i].number-- // уменьшаем счетчик
                if (ordersList[i].number === 0) { // если число заказов данной модели = 0
                    // оставляем в массиве заказов все заказы кроме этого (фильтруем)
                    ordersList = ordersList.filter( phone => phone.name !== phoneBrandAndName)
                    localStorage.setItem("orders", JSON.stringify(ordersList)) // обновляем хранилище
                    return 0 // возвращаем число заказов данной модели
                }
            }

            return ordersList[i].number // возвращаем число заказов данной модели
        }
    }

    // если это запрос на получение числа заказов и заказов данной модели нет - возвращаем 0
    if (action === null) return 0

    // если этой модели нет в заказах и action != null - значит это новый заказ
    ordersList.push({name: phoneBrandAndName, number: 1}) // добавляем объект с заказом в массив заказов
    localStorage.setItem("orders", JSON.stringify(ordersList)) // обновляем хранилище
    return 1 // возвращаем число заказов данной модели
}

// функция создания карточки товара и добавления товара в каталог
function addPhoneToCatalog( phone ) {
    const numberOfOrdered = checkOrder( phone.brand + ' ' + phone.model) // определяем полное название товара

    // если мы на странице 'cart' (корзина) и товар не заказан - выходим из функции
    if (pageName === 'cart' && numberOfOrdered < 1) return

    // создаем <div> карточки товара и заполняем тегами и информацией
    const phoneCard = document.createElement('div')
    phoneCard.className = 'phone-card'

    // название
    const title = document.createElement('h3')
    title.innerHTML = phone.brand + ` <span>${phone.model}</span>`
    phoneCard.append( title )

    // фото и описание
    const descriptionContainer = document.createElement('div')
    descriptionContainer.className = 'description-container'
    phoneCard.append( descriptionContainer )

    const imageDiv = document.createElement('div') // див вокруг фото
    imageDiv.className = 'div-image'
    descriptionContainer.append( imageDiv ) 
    const image = document.createElement('img') // само фото
    image.src = './src/images/phones/' + phone.image
    imageDiv.append( image )

    const description = document.createElement('div')
    description.className = 'description'
    description.innerHTML = `
        <div><span>Экран:</span> ${phone.screen} <span>дюймов</span></div>
        <div><span>Камера:</span> ${phone.camera} <span>Мпикс.</span></div>
        <div><span>Батарея:</span> ${phone.battery} <span>мА/час</span></div>
        <div><span>Оперативная память:</span> ${phone.RAM} <span>ГБ</span></div>
        <div><span>Основная память:</span> ${phone.ROM} <span>ГБ</span></div>
        `
    descriptionContainer.append( description )

    // цена и кнопка заказа
    const orderContainer = document.createElement('div')
    orderContainer.className = 'order-container' 
    description.append(orderContainer)

    const price = document.createElement('div')
    price.className = 'price'
    price.innerHTML = `<span>Цена:</span> ${phone.price} BYN`
    orderContainer.append(price)

    const orderButtonContainer = document.createElement('div')
    // вызываем функцию, заполняющую информацию о заказе (кнопку "ЗАКАЗАТЬ" или счетчик и редактор заказа модели)
    updatePhoneCardOrder(orderButtonContainer, numberOfOrdered)

    orderContainer.append(orderButtonContainer)

    // добавляем карточку в каталог
    catalog.append( phoneCard )
}

// функция заполнения информации о заказе в карточке товара (кнопка "ЗАКАЗАТЬ" или счетчик и редактор заказа модели)
function updatePhoneCardOrder(orderButtonContainer, numberOfOrdered) {
    // очищаем тег от предыдущих элементов
    orderButtonContainer.innerHTML = ''

    // если товар еще не заказан - создаем кнопку "ЗАКАЗАТЬ"
    if (numberOfOrdered === 0) {
        const button = document.createElement('button')
        button.className = 'add-to-cart-first'
        button.innerText = 'ЗАКАЗАТЬ'
        button.onclick = addToCartClicked
        orderButtonContainer.append(button)
    } else {
        // если товар уже заказан - добавляем счетчик и кнопки для редактирования заказа
        const orderTitle = document.createElement('span')
        orderTitle.className = 'order-title'
        orderTitle.innerText = 'В КОРЗИНЕ :'
        orderButtonContainer.append(orderTitle)

        const addButton = document.createElement('button')
        addButton.className = 'add-to-cart'
        addButton.innerText = '+'
        addButton.onclick = addToCartClicked
        orderButtonContainer.append(addButton)

        const orderCounter = document.createElement('span')
        orderCounter.className = 'order-counter'
        orderCounter.innerText = numberOfOrdered
        orderButtonContainer.append(orderCounter)

        const removeButton = document.createElement('button')
        removeButton.className = 'remove-from-cart'
        removeButton.innerText = '-'
        removeButton.onclick = removeFromCartClicked
        orderButtonContainer.append(removeButton)
    }
}

// функция, вызываемая при клике на добавление (увеличение) заказа
function addToCartClicked( event ) {
    const button = event.target
    const orderButtonContainer = button.parentElement
    const phoneCard = orderButtonContainer.parentElement.parentElement.parentElement.parentElement
    const h3 = phoneCard.querySelector('h3')
    const name = h3.innerText
    const numberOfOrdered = checkOrder( name, '+' )

    orderedSmartphoneCounter++
    headerCartCounter.innerText = orderedSmartphoneCounter

    updatePhoneCardOrder(orderButtonContainer, numberOfOrdered)
}

// функция, вызываемая при клике на удаление (уменьшение) заказа
function removeFromCartClicked( event ) {
    const button = event.target
    const orderButtonContainer = button.parentElement
    const phoneCard = orderButtonContainer.parentElement.parentElement.parentElement.parentElement
    const h3 = phoneCard.querySelector('h3')
    const name = h3.innerText
    const numberOfOrdered = checkOrder( name, '-' )

    orderedSmartphoneCounter--
    headerCartCounter.innerText = orderedSmartphoneCounter

    if (pageName === 'cart' && numberOfOrdered === 0) {
        phoneCard.remove() // если мы в корзине и заказ полностью удален - удаляем его карточку
        if (orderedSmartphoneCounter === 0) {
            const info = `<h4 style="text-align: center">У вас нет заказов. Перейдите <a href="./catalog.html">в каталог</a> для выбора смартфонов.</h4>`
            catalog.innerHTML = info
        }
    }
    else {
        updatePhoneCardOrder(orderButtonContainer, numberOfOrdered)
    }
}

// если мы на странице 'cart' и заказов нет - выводим текст сл ссылкой на каталог
if (pageName === 'cart' && orderedSmartphoneCounter < 1) {
    const info = `<h4 style="text-align: center">У вас нет заказов. Перейдите <a href="./catalog.html">в каталог</a> для выбора смартфонов.</h4>`
    catalog.innerHTML = info
}
else {
    if (pageName === 'cart' || pageName === 'catalog')
    // если мы в каталоге или на странице 'cart' с заказами - заполняем каталог товарами
    PRODUCTS.forEach( addPhoneToCatalog ) // для каждого смартфона вызывается функция добавления в каталог
}