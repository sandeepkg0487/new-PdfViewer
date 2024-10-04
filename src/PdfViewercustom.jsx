import * as pdfjs from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";
import { useCallback } from "react";
import { useEffect, useRef, useState } from "react";
import URI from "./assets/sample12.pdf"

// const URI = 'https://api24.ilovepdf.com/v1/download/lbr3wzz5ynw4zldpq6jgt8t4t06h97tcyncy7m1ylpql633hddrfq24w46h62jslq92fk7vgx65qb0npmflmy00jzmpkznlb5y81n9zq8rxfpAm9bAdr4vsljzmhb1xww9ws4yv5lblfrmcxg3qqn6433AyxntA2wksmc67ld5Awp6p9v8t1'
// pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

const gap = 5;
const pdfPageNumber = "secondPdf_"
const canvasId = 'canvasId_'
const container  = "container2"
const selectPdfPage = "selectPdfPage"


const PdfViewer = (props) => {

	const {
		isunvisitedPage

	} = props

////////////////// uniquestates  ////////////////
const scrolldivRef1 = useRef()
const isLoadingRef = useRef(true);

///////////////////////////////

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
	const [currentPage, setCurrentPage] = useState(1)
	const [ruler, setRuler] = useState({})
	const [displayCurrentPage, setDisplayCurrentPage] = useState(0)
	const [loader, setLoader] = useState(true)
	
	const [visitedPages, setVisitedPages] = useState([]);
	const [fitToScreen, setFitToScreen] = useState(0)



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
			setFitToScreen(initScale)
			setScale(initScale)
			setLoader(false)

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
			} else {
				setActiveElement(pageDetails.slice(start, end));
				const top = ((pageDetails[start].cumulativeHeight - (gap * start)) * scale) + (gap * start);
				setActiveTop(top);
			}
			setDisplayCurrentPage(currentPage)

		}, 0);

		return () => {
			clearTimeout(changetimeout);
		};

	}, [pageDetails, scale, currentPage]);


	const gotopage = useCallback((pagenumber) => {

		const currentscrollLocation = (pageDetails[pagenumber - 1].cumulativeHeight -(pagenumber*gap))*scale +(pagenumber*gap)
		scrolldivRef1.current.scrollTo({
			top: currentscrollLocation+15 ,
			behavior: "smooth",
		});

	}, [pageDetails, scale])

	/////////////////////// unvisited page ////////////////////////
	useEffect(() => {
		if (numPages > 0 && isunvisitedPage) {
			const initialVisited = new Array(numPages).fill(false);
			initialVisited[currentPage - 1] = true;
			setVisitedPages(initialVisited);
		}
	}, [numPages]);


	useEffect(() => {
		if (isunvisitedPage) {


			const timer = setTimeout(() => {
				setVisitedPages((prev) => {
					const newVisited = [...prev];
					newVisited[currentPage - 1] = true;
					return newVisited;
				})

			}, 1000);


			return () => clearTimeout(timer);
		}
	}, [currentPage])

	///////////////////////////////////////////////)

	const handleRotate = useCallback((currentPage, position) => {
		const newPageDetails = [...pageDetails];
		const targetPage = newPageDetails[currentPage - 1];

		if (!targetPage) return;

		const oldHeight = targetPage.height;
		targetPage.rotate = (targetPage.rotate + (90 * position)) % 360;
		const tempWidth = targetPage.width;
		targetPage.width = targetPage.height;
		targetPage.height = tempWidth;

		const heightDifference = targetPage.height - oldHeight;

		for (let i = currentPage; i < newPageDetails.length; i++) {
			newPageDetails[i].cumulativeHeight += heightDifference;
		}
		const element = document.getElementById(canvasId + (currentPage - 1));
		if (element) {
			element.remove();
		}
		setTotalHeight(prev => prev + heightDifference)
		setPageDetails(newPageDetails);
	}, [pageDetails]);

	const handleScroll = (e) => {
		if (e.currentTarget) {
			const scrollTop = e.currentTarget.scrollTop+250;

			let isLastElement = true
			for (let i = 0; i < pageDetails.length; i++) {
				const pageHeight = ((pageDetails[i].cumulativeHeight - (i * gap)) * scale) + (i * gap);


				if (scrollTop < pageHeight) {
					setCurrentPage(i);
					isLastElement = false
					break;
				}

			}
			if (isLastElement) {
				setCurrentPage(numPages);
			}
		}

	};

	const handleChange = (e) => {
		setDisplayCurrentPage(e.target.value)

	}
	const handleKeyDown = (event) => {
		if (event.key === 'Enter') {
			gotopage(displayCurrentPage);
		}
	};



	///////////////////////////////////////////////
	const handleZoom = (status) => { // status : -1 | 1
		const newScale = scale + (0.1 * status);
		if (newScale >= 0.5 && newScale <= 3.5) {
			
			setActiveElement([])
			
			setScale(newScale);
			if (scrolldivRef1.current) {
	
				scrolldivRef1.current.scrollBy({
					top: 1,
					behavior: 'smooth',
				});
			}
		}

	}

	//////////////////////////////////////////////


	////////////////////////// append canvas //////////////////

	useEffect(() => {
		const createCanvas = (pageNum, rotation = 0, scaleFactor, pageDetails) => {
			let viewport;
			let page = pageDetails.page
			if (!page) {
				return
			}

			viewport = page.getViewport({
				scale: scaleFactor,
				rotation
			});

			const canvas = document.createElement("canvas");
			canvas.width = viewport.width;
			canvas.height = viewport.height;
			canvas.id = canvasId + pageDetails._pageIndex;

			const context = canvas.getContext("2d");
			const renderContext = {
				canvasContext: context,
				viewport
			};
			return page.render(renderContext).promise.then(() => {
				return { success: true, pageNumber: page._pageIndex + 1, element: canvas, rotation };
			});

		};
		const loadCanvas = async () => {
			const pdfContainer = document.getElementById(container);
			const idsWithoutCanvas = [];
			isLoadingRef.current = true;
			if (pdfContainer) {
				const divs = pdfContainer.getElementsByClassName(selectPdfPage);
				for (const div of divs) {
					if (!isLoadingRef.current) break;  // Stop if the loading state changes

					const noCanvas = Number(div.id.split("_")[1]);
					const isActive = document.getElementById(`${pdfPageNumber}${noCanvas}`);

					if (isActive && !isActive.querySelector('canvas')) {

						idsWithoutCanvas.push(noCanvas);
						const pdSinglePageDetails = pageDetails[noCanvas];

						const canvas = await createCanvas(idsWithoutCanvas._pageIndex, pdSinglePageDetails.rotate, scale, pdSinglePageDetails);

						canvas.element.id = canvasId+noCanvas;

						if (!div.querySelector('canvas')) {
							div.appendChild(canvas.element);
						}
					}
				}
			}

		};
		const loadTimeOut = setTimeout(() => {

			loadCanvas();
		}, 300)

		return () => {
			clearTimeout(loadTimeOut)
			isLoadingRef.current = false;
		};
	}, [activeElement])

	//////////////////////////////////////////////////////////
	//////////////////////// goto location //////////////////////////

	const handleRuler = useCallback((event) => {
		if (event.altKey) {
		    if (event.keyCode === 71 && ruler) { // 'G'
			event.preventDefault();
	    
			
			const scrollPos = ((pageDetails[ruler.pageNumber].cumulativeHeight - (ruler.pageNumber * gap)) * scale) + ruler.top + (ruler.pageNumber * gap);
	    
			scrolldivRef1.current.scrollTo({
			    top: scrollPos - 300,
			    behavior: 'smooth',
			});
		    }
		    if (event.keyCode  === 81 && ruler) { // 'Q'
			event.preventDefault();
			setRuler();
		    }
		}
	    }, [ruler, scale ]);

	    useEffect(() => {
		window.addEventListener('keydown', handleRuler);
	    
		// Cleanup the event listener on component unmount
		return () => {
		    window.removeEventListener('keydown', handleRuler);
		};
	    }, [handleRuler])

	const [percentage, setPercentage] = useState();
	const options = [
		{
			key: " Fit to screen",
			value: fitToScreen
		},
		{
			key: " Actual Width",
			value: 1
		},
		{

			key: "100%",
			value: 1
		},
		{
			key: "150%",
			value: 1.5
		}
		,
		{
			key: "200%",
			value: 2
		},
		{
			key: "250%",
			value: 2.5
		},
		{
			key: "300%",
			value: 3
		},
		{
			key: "350%",
			value: 3.5
		}
	];

	const handleChangeselect = (event) => {
		setPercentage(event.target.value);
		setScale(event.target.value)
		setActiveElement([])

	      };	

	return (
		<>
			<div
				style={{
					height: "50px",
					borderBottom: "1px solid red",
				}}>


				<div style={{ color: "black " }} className="d-flex gap-2">
					<input
						type="number"
						value={displayCurrentPage}
						onChange={handleChange}
						onKeyDown={handleKeyDown}
						placeholder="Enter a number"
						className="border-0 rounded no-arrows px-2"
						style={{
							width: "50px",
							outline: "none",
						}}
					/>
					/ {numPages}
				</div>

				<button onClick={() => handleRotate(currentPage, -1)} >Rotte</button>
				<button onClick={() => handleZoom(-1)} >zoom out </button>
				<button onClick={() => handleZoom(1)} >zoom in </button>
				<select value={percentage} onChange={handleChangeselect}>
					{options.map((option) => (
						<option key={option.key} value={option.value}>
							{option.key}
						</option>
					))}
				</select>
				<button onClick={()=>{gotopage(1)}}  > goto first</button>
				<button onClick={()=>{gotopage(currentPage+1)}}  > next</button>
				<button onClick={()=>{gotopage(currentPage-1)}}  > prev</button>
				<button onClick={()=>{gotopage(numPages)}}  > goto last</button>



			</div>
			<div
				onScroll={handleScroll}
				style={{
					maxWidth: '100vw',
					height: 'calc(100vh - 70px)',
					overflow: "scroll",
				}}
				id='scrollDiv'
				ref={scrolldivRef1}
			>
				<div


					style={{

						display: "flex",
						justifyContent: "center",
						overflow: "none",
						// backgroundColor: 'aliceblue',
						height: `${((totalHeight - (numPages * gap)) * scale) + numPages * gap}px`,
						position: "relative",

					}}>

					<div

						id={container}
						className="container"
						style={{
							minWidth: '100%',
							// marginTop: "50px",
							// transform: `scale(${scale+1})`,
							transformOrigin: 'center',
							transition: 'transform 0.1s ease-out',
							display: 'grid',
							gap: `${gap}px 10px`,
							height: 'fit-content',
							minHeight: "70vh",
							position: "absolute",
							top: `${activeTop}px`,
							overflow: "scroll",
							justifyItems: 'center',
							backgroundColor: 'cadetblue'

						}}
					>
						{
							activeElement?.map((item) => (

								<div
									key={item._pageIndex}
									// style={styles.container}
									id={`${pdfPageNumber}${item?._pageIndex}`}
									data-page-number_="1"
									style={{
										width: `${item.width * scale}px`,
										height: `${item.height * scale}px`,
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
										border: '1px solid red',
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
									className={selectPdfPage}
								>

									{(item?._pageIndex === ruler.pageNumber) && <div
										style={{
											position: 'absolute',
											height: "2px",
											width: "100%",
											backgroundColor: "red",
											top: `${ruler.top}px`
										}}
										className="ruler_div "

									>

									</div>}
								</div>

							)

							)


						}
						{loader && (
							<div style={{ position: "absolute", top: "50%", left: " 50%", zIndex: "100", transform: "translate(-50%, -50%)" }}>
								<div className="spinner-border " role="status" style={{ width: "3rem", height: "3rem", color: "#1ba2a8 " }}>
									<span className="sr-only"></span>
								</div>
							</div>
						)}




					</div>
				</div>



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