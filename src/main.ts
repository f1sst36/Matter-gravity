import GravityBox from "./html-integration/GravityBox";
import "./style.css";

const container = document.getElementById("container");

if (!container) {
	throw new Error("container is null");
}

const gravityBox = new GravityBox({
	container: container,
	items: Array.from(document.querySelectorAll(".tag")) as HTMLDivElement[],
});
gravityBox.start();
gravityBox.initEvents();
