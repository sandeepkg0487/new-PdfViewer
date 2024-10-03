import * as pdfjs from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";
import { useCallback } from "react";
import { useEffect, useRef, useState } from "react";

// pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

const PdfViewer = ({ loader, setLoader, currentPage, setCurrentPage, numPages, pdf }) => {
	// const [currentPage, setCurrentPage] = useState(1);
	const [pageDetails, setPageDetails] = useState([]);
	const [currentLoadPage, setCurrentLoadPage] = useState({});
	const [zoom, SetZoom] = useState(1);
	const [heightOfAllPage, setHeightOfAllPage] = useState(0);
	const [heightOfAllPageTemp, setHeightOfAllPageTemp] = useState(0);

	



	

	return (
		<>
			<h1>hiiii</h1>
		</>
	);
};

export default PdfViewer;
