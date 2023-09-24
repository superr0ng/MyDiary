/* global axios */
const itemTemplate = document.querySelector(".item-template");
const itemList = document.querySelector(".items");
const chineseNum = ["日", "一", "二", "三", "四", "五", "六"];

const instance = axios.create({
    baseURL: "http://localhost:8000/api",
});

async function Main(){
    SetUpEventListeners();
    try{
        const diarys = await GetDiarys();
        diarys.forEach(diary => RenderDiary(diary));
    }
    catch(error){
        alert("Failed to load diarys!");
    }
}

async function SetUpEventListeners(){
    const editDiaryPage = document.querySelector(".diary-edit-page");
    const editDate = editDiaryPage.querySelector(".edit-page-date");
    const editTag = editDiaryPage.querySelector(".edit-page-tag");
    const editMood = editDiaryPage.querySelector(".edit-page-mood");
    const editText = editDiaryPage.querySelector(".edit-page-text");
    const editImage = editDiaryPage.querySelector(".edit-page-img");
    
    // ######### Edit Page #########
    // Set up the save button in edit page
    const saveButton = editDiaryPage.querySelector(".save-button");
    saveButton.addEventListener("click", async () => {
        const id = editDiaryPage.dataset.id;
        const date = editDate.value;
        const tag = editTag.value;
        const mood = editMood.value;
        const text = editText.value;
        const image = editImage.src;

        if(!date){
            alert("Please select a valid date!");
            return;
        }
        if(!tag){
            alert("Please select tag!");
            return;
        }
        if(!mood){
            alert("Please select mood!");
            return;
        }
        if(!text){
            alert("Please enter text!");
            return;
        }
        try{
            if(id){
                const diary = await EditDiary(id, {date, tag, mood, text, image});
                RemoveDiaryElementById(id)
                RenderDiary(diary);
            }
            else{
                const diary = await CreateDiary({date, tag, mood, text, image});
                RenderDiary(diary);
            }
        }
        catch(error){
            alert("Failed to create diary!");
            return;
        }
        // Close edit page.
        const uploadImgButton = editDiaryPage.querySelector(".edit-input-img");
        uploadImgButton.value = '';
        editDiaryPage.style.display = "none";
        return;
    });

    // Set up the cancel button in edit page
    const cancelButton = editDiaryPage.querySelector(".cancel-button");
    cancelButton.addEventListener("click", async () => {
        // Close edit page.
        editDiaryPage.style.display = "none";
        return;
    });

    // Set up upload img button
    const uploadImgButton = editDiaryPage.querySelector(".edit-input-img");
    uploadImgButton.addEventListener("change", (event) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(event.target.files[0]);
        fileReader.addEventListener("load", (event) => {
            editImage.src = fileReader.result;
        });
    });


    // ######### Read Page #########
    // Set up the close button in read page
    const readDiaryPage = document.querySelector(".diary-read-page");
    const closeButton = readDiaryPage.querySelector(".close-button")
    closeButton.addEventListener("click", () => {
        readDiaryPage.style.display = "none";
    });

    // Set up the edit button in read page
    const editButton = readDiaryPage.querySelector(".edit-button");
    editButton.addEventListener("click", async () => {
        // Copy content from read page to edit page
        const date = readDiaryPage.querySelector(".read-page-date").innerText;
        const tag = readDiaryPage.querySelector(".read-page-tag").innerText;
        const mood = readDiaryPage.querySelector(".read-page-mood").innerText;
        const text = readDiaryPage.querySelector(".read-page-text").innerText;
        const image = readDiaryPage.querySelector(".read-page-img").src;

        editDiaryPage.dataset.id = readDiaryPage.dataset.id;
        const newDate = new Date(date);
        editDate.valueAsDate = new Date(Date.UTC(newDate.getFullYear(), newDate.getMonth(), newDate.getDate()));
        editTag.value = tag;
        editMood.value = mood;
        editText.value = text;
        editImage.src = image;

        // close read page and open edit page
        editDiaryPage.style.display = "block";
        readDiaryPage.style.display = "none";
    });

    // Set up the delete button in read page
    const deleteButton = readDiaryPage.querySelector(".delete-button");
    deleteButton.addEventListener("click", async () => {
        const id = readDiaryPage.dataset.id;
        try{
            await DeleteDiaryById(id);
        }
        catch(error){
            console.log(error);
            alert("Failed to delete diary!");
        }
        finally{
            RemoveDiaryElementById(id);
            readDiaryPage.style.display = "none";
        }
    });


    // ######### Home Page #########
    // Set up add-diary button
    const addDiaryButton = document.querySelector(".add-diary-button");
    addDiaryButton.addEventListener("click", async () => {
        // Set the date to current date and empty the tag, mood and text.
        const newDate = new Date();
        editDiaryPage.dataset.id = '';
        editDate.valueAsDate = new Date(Date.UTC(newDate.getFullYear(), newDate.getMonth(), newDate.getDate()));
        editTag.value = '';
        editMood.value = '';
        editText.value = '';
        editImage.src = '';

        // Display the edit page.
        editDiaryPage.style.display = "block";
    });

    // Set up the filter
    const filter = document.querySelector("select.filter");
    filter.addEventListener("change", async () => {
        Array.from(itemList.children).forEach(item => {
            if(!filter.value)
                item.style.display = "block";
            else if(item.querySelector(".item-tag").innerText === filter.value || item.querySelector(".item-mood").innerText === filter.value)
                item.style.display = "block";
            else
                item.style.display = "none";
        });
    });
}
function RenderDiary(diary){
    const item = CreateDiaryElement(diary);
    itemList.appendChild(item);
}

function CreateDiaryElement(diary){
    const item = itemTemplate.content.cloneNode(true);
    const container = item.querySelector(".item-container");
    container.id = diary.id;
    const itemDate = container.querySelector(".item-date");
    const date = new Date(diary.date);
    itemDate.innerText = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${(date.getDate()).toString().padStart(2, '0')} (${chineseNum[date.getDay()]})`;
    const itemTag = container.querySelector(".item-tag");
    itemTag.innerText = diary.tag;
    const itemMood = container.querySelector(".item-mood");
    itemMood.innerText = diary.mood;
    const itemText = container.querySelector(".item-text");
    itemText.innerText = diary.text;
    const itemImage = container.querySelector(".item-img");
    itemImage.src = diary.image;
    container.addEventListener("click", () => {
        // copy the diary to read-page
        const readDiaryPage = document.querySelector(".diary-read-page");
        const readDate = readDiaryPage.querySelector(".read-page-date");
        const readTag = readDiaryPage.querySelector(".read-page-tag");
        const readMood = readDiaryPage.querySelector(".read-page-mood");
        const readText = readDiaryPage.querySelector(".read-page-text");
        const readImage = readDiaryPage.querySelector(".read-page-img");

        readDiaryPage.dataset.id = container.id
        readDate.innerText = itemDate.innerText;
        readTag.innerText = itemTag.innerText;
        readMood.innerText = itemMood.innerText;
        readText.innerText = itemText.innerText;
        readImage.src = itemImage.src;
        // Show read page
        readDiaryPage.style.display = "block";
    })
    return item;
}

function RemoveDiaryElementById(id){
    const diary = document.getElementById(id);
    diary.remove();
}

async function GetDiarys(){
    const response = await instance.get("/diarys");
    return response.data;
}

async function CreateDiary(diary){
    const response = await instance.post("/diarys", diary);
    return response.data;
}

async function EditDiary(id, diary){
    const response = await instance.put(`/diarys/${id}`, diary);
    return response.data;
}

async function DeleteDiaryById(id){
    const response = await instance.delete(`/diarys/${id}`);
    return response.data;
}
Main();