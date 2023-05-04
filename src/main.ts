import Area from "./html-integration/Area.ts";
import "./style.css";

const container = document.getElementById("area");

if (!container) {
	throw new Error("container is null");
}

const area = new Area(container);

area.start();
area.initEvents();
