import * as pdfjs from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";
import { useCallback } from "react";
import { useEffect, useRef, useState } from "react";
import URI from "./assets/sample12.pdf"


// pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

const gap = 5;

const PdfViewer = () => {
	const [pageDetails, setPageDetails] = useState([]);
	const [currentLoadPage, setCurrentLoadPage] = useState({});
	const [scale, setScale] = useState(1)
	const [heightOfAllPage, setHeightOfAllPage] = useState(0);
	const [heightOfAllPageTemp, setHeightOfAllPageTemp] = useState(0);
	const [numPages, setNumPages] = useState(0)
	const [activeElement, setActiveElement] = useState([])
	const [pdf, setPdf] = useState(null)
	const [activeTop, setActiveTop] = useState(0)
	const [totalHeight, setTotalHeight] = useState(0)
	const [currentPage, setCurrentPage] = useState(0)
	const [ruler, setRuler] = useState({})


	useEffect(() => {
		const loadDocument = async () => {
			try {
				const loadingTask = pdfjs.getDocument(URI);
				const loadedPdf = await loadingTask.promise;
				setPdf(loadedPdf);
				setNumPages(loadedPdf.numPages);

			} catch (error) {
				console.error("error on loading URl:", error)
			}
		};

		if (URI) {

			loadDocument();
		}

	}, [URI]);

	useEffect(() => {


		const renderStart = async () => {
			if (!pdf) {
				console.warn("pdf is not there 2", pdf)
				return;
			}

			let page_Height = 0;
			let large_page_width = 0


			let updatedDetails = []
			for (let pageNum = 1; pageNum <= numPages; pageNum++) {
				let page = null
				try {
					page = await pdf.getPage(pageNum);
				} catch (error) {
					console.error('@@@ test Error page 2:', pageNum, error)
				}
				if (page) {


					let pageDetails = {
						width: page?._pageInfo.view[2],
						height: page?._pageInfo.view[3],
						rotate: page?._pageInfo.rotate,
						isActive: true,
						cumulativeHeight: page_Height,
						page: page,
						_pageIndex: page._pageIndex
					};
					page_Height += page?._pageInfo.view[3] + gap;
					updatedDetails.push(pageDetails)
					if (large_page_width < page?._pageInfo.view[2]) {
						large_page_width = page?._pageInfo.view[2]
					}

				}

			}

			setPageDetails(updatedDetails);
			setTotalHeight(page_Height);

			const innerWidth = window.innerWidth - 100
			let initScale = parseFloat((innerWidth / large_page_width).toFixed(2));
			setScale(initScale)
			console.log(scale);


		};

		renderStart();
	}, [pdf]);


	const pagesToShow = 10;
	const halfPages = Math.floor(pagesToShow / 2);

	useEffect(() => {
		const changetimeout = setTimeout(() => {
			if (pageDetails.length === 0) {
				setActiveElement([]);
				return;
			}

			
			const start = Math.max(0, currentPage - halfPages);
			const end = Math.min(numPages, start + pagesToShow);

			
			if (currentPage > numPages - halfPages) {
				const startAdjustment = Math.max(0, numPages - pagesToShow);
				setActiveElement(pageDetails.slice(startAdjustment, numPages));
				setActiveTop(((pageDetails[startAdjustment].cumulativeHeight - (gap * startAdjustment)) * scale) + (gap * startAdjustment));
				console.log(startAdjustment,end,"@@@")
			} else {
				setActiveElement(pageDetails.slice(start, end));
				const top = ((pageDetails[start].cumulativeHeight - (gap * start)) * scale) + (gap * start);
				setActiveTop(top);
				console.log(start,end,"@@@")
			}
			

		}, 300);

		return () => {
			clearTimeout(changetimeout);
		};

	}, [pageDetails, scale, currentPage]);






	const handleScroll = (e) => {

		if (e.currentTarget) {
			const scrollTop = e.currentTarget.scrollTop;
			let accumulatedHeight = 0;

			for (let i = 0; i < pageDetails.length; i++) {
				const pageHeight = pageDetails[i].height * scale;
				accumulatedHeight += pageHeight;

				if (scrollTop < accumulatedHeight) {
					setCurrentPage(i + 1);
					break;
				}
			}
		}
	};





	return (
		<>
			<div
				onScroll={handleScroll}
				style={{
					maxWidth: '100vw',
					height: "93vh",
					overflow: "scroll",
					margin: "10px "
				}}
				id='scrollDiv'
			>
				<div


					style={{

						display: "flex",
						justifyContent: "center",
						overflow: "none",
						// backgroundColor: 'aliceblue',
						height: `${((totalHeight - (numPages*gap)) * scale)+numPages*gap}px`,
						position: "relative",

					}}>

					<div

						id="container2"
						className="container"
						style={{
							width: '100%',
							// marginTop: "50px",
							// transform: `scale(${scale+1})`,
							transformOrigin: 'center',
							transition: 'transform 0.1s ease-out',
							display: 'grid',
							gap: `${gap}px 10px`,
							height: 'fit-content',
							position: "absolute",
							top: `${activeTop}px`,

						}}
					>
						{
							activeElement?.map((item) => (

								<div
									key={item._pageIndex}
									// style={styles.container}
									id={`data-page-number_${item?._pageIndex}`}
									data-page-number_="1"
									style={{
										width: `${item.width * scale}px`,
										height: `${item.height * scale}px`,
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
										border: '1px solid rgba(0, 0, 0, 0.09)',
										position: 'relative',
										backgroundColor: 'aliceblue',

									}}
									onDoubleClick={(e) => {
										e.stopPropagation(); // Prevent the click from bubbling up to the parent

										// Get the bounding rectangle of the clicked div
										const rect = e.currentTarget.getBoundingClientRect();
										// Calculate the click position relative to the clicked div
										const clickY = e.clientY - rect.top;
										setRuler({ pageNumber: item._pageIndex, top: clickY })

									}}
								>
									<h1>{item?._pageIndex}</h1>

									{(item?._pageIndex === ruler.pageNumber) && <div
										style={{
											position: 'absolute',
											height: "2px",
											width: "100%",
											backgroundColor: "red",
											top: `${ruler.top}px`
										}}
										className="ruler_div"
									>

									</div>}
								</div>

							)

							)


						}




					</div>
				</div>

				{/* {is_loadingCanvas && <div className="position-absolute top-0 end-0">
					<div class=" spinner-border text-primary" role="status"></div>
				</div>} */}

			</div>
		</>
	);
};

export default PdfViewer;

const styles = {
	container: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		border: '1px solid rgba(0, 0, 0, 0.09)',
		position: 'relative',
		height: '125.45px',
		width: '125.45px',
	},
	text: {
		color: 'rgb(87, 87, 87)',
		fontWeight: 'bold',
		position: 'absolute',
		top: '-25px',
	},
	innerDiv: {
		position: 'relative',
		display: 'flex',
		justifyContent: 'center',
		backgroundColor: 'aliceblue',

	},
	checkbox: {
		position: 'absolute',
		left: '0px',
		bottom: '0px',
	},
};