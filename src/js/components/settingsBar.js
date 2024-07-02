
export function createSettingsBar() {
        const div = document.createElement("div");
        div.classList.add("order-settings");
        // if (window.innerWidth > 1) {
                div.innerHTML = `
                        <ul class="order">
                                <li id="grid">
                                        <span class="material-symbols-outlined four-columns active">table_rows_narrow</span>
                                        <span class="material-symbols-outlined three-columns ">view_column</span>
                                        <span class="material-symbols-outlined two-columns ">view_column_2</span>
                                </li>
                                <li id="limit">
                                        <select name="limit">
                                                <option value="8">8</option>
                                                <option value="12">12</option>
                                                <option value="16">16</option>
                                                <option value="20">20</option>
                                        </select>
                                </li>
                                <li id="pagination">
                                        <span class="material-symbols-outlined button first_page">first_page</span>     
                                        <span class="material-symbols-outlined button before">chevron_left</span>
                                        <span class="before"></span>
                                        <span class="current">1</span><span class="after">2</span>
                                        <span class="material-symbols-outlined button after">chevron_right</span>
                                        <span class="material-symbols-outlined button last_page">last_page</span>
                                </li>
                        </ul>
            `;
      //   }
        // else {
        //         div.innerHTML = `
        //                 <ul class="order">
        //                         <li id="grid">
        //                         <span class="material-symbols-outlined three-columns active">view_column</span>
        //                         <span class="material-symbols-outlined two-columns">view_column_2</span>
        //                         </li>
        //                         <li id="limit">
        //                         <select name="limit">
        //                                 <option value="8">8</option>
        //                                 <option value="12">12</option>
        //                                 <option value="16">16</option>
        //                                 <option value="20">20</option>
        //                         </select>
        //                         </li>
        //                         <li id="pagination"><span class="material-symbols-outlined button first_page">first_page</span><span
        //                         class="material-symbols-outlined button before">chevron_left</span><span class="before"></span><span
        //                         class="current">1</span><span class="after">2</span><span
        //                         class="material-symbols-outlined button after">chevron_right</span><span
        //                         class="material-symbols-outlined button last_page">last_page</span></li>
        //                 </ul>
        //     `;
        // }

        if (window.innerWidth <= 1024) {
                const three_columns_icon = div.querySelector(".three-columns");
                const four_columns_icon = div.querySelector(".four-columns");
                four_columns_icon.classList.remove("active");
                four_columns_icon.style.display = "none";
                
                three_columns_icon.classList.add("active");
        }

        return div;
}
