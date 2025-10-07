export default function WorkSessionList() {
    // 1) Load all the work sessions from local storage (later will be take from account)
    // 2) Render all the sessions on the page
    // 3) For each work session you are able to click on it, and see the details

    return (
        <div className="flex flex-col gap-3 px-6 text-gray-500">
            <h1 className="">Session #1</h1>
            <h1 className="">Session #2</h1>
            <h1 className="">Session #3</h1>
        </div>
    )
}