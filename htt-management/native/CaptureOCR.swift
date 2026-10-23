import Foundation
import Vision
import PDFKit
import ImageIO
import AppKit
struct Line: Codable { let page:Int; let text:String; let confidence:Float }
struct Output: Codable { let engine:String; let pages:Int; let lines:[Line] }
func fail(_ message:String) -> Never { FileHandle.standardError.write(Data(message.utf8)); exit(1) }
func recognize(_ image:CGImage, _ page:Int) throws -> [Line] {
 let request=VNRecognizeTextRequest(); request.recognitionLevel = .accurate
 request.recognitionLanguages=["en-AU","en-US"]; request.usesLanguageCorrection=false
 try VNImageRequestHandler(cgImage:image,options:[:]).perform([request])
 let observations=(request.results ?? []).sorted { a,b in abs(a.boundingBox.midY-b.boundingBox.midY)>0.012 ? a.boundingBox.midY>b.boundingBox.midY : a.boundingBox.minX<b.boundingBox.minX }
 var rows:[(Double, String, Float)]=[]
 for o in observations { guard let c=o.topCandidates(1).first else { continue }
  if let last=rows.last, abs(last.0-Double(o.boundingBox.midY))<0.012 { rows[rows.count-1]=(last.0,last.1+"  "+c.string,min(last.2,c.confidence)) }
  else { rows.append((Double(o.boundingBox.midY),c.string,c.confidence)) }
 }
 return rows.map { Line(page:page,text:$0.1,confidence:$0.2) }
}
guard CommandLine.arguments.count==2 else { fail("Select one source document.") }
let url=URL(fileURLWithPath:CommandLine.arguments[1]);var result:[Line]=[];var count=1
 do {
 if url.pathExtension.lowercased()=="pdf" {
  guard let pdf=PDFDocument(url:url), !pdf.isLocked, pdf.pageCount>0, pdf.pageCount<=10 else { fail("Use an unlocked PDF with 1–10 pages.") }
  count=pdf.pageCount
  for i in 0..<count { try autoreleasepool {
   guard let page=pdf.page(at:i) else { fail("Cannot read PDF page.") }
   let bounds=page.bounds(for:.mediaBox);guard bounds.width>0,bounds.height>0,bounds.width.isFinite,bounds.height.isFinite else { fail("Invalid PDF page size.") }
   let scale=min(2400/bounds.width,3200/bounds.height)
   let image=page.thumbnail(of:NSSize(width:bounds.width*scale,height:bounds.height*scale),for:.mediaBox)
   guard let cg=image.cgImage(forProposedRect:nil,context:nil,hints:nil) else { fail("Cannot render PDF page.") }
   result += try recognize(cg,i+1)
  } }
 } else {
  guard let source=CGImageSourceCreateWithURL(url as CFURL,nil),CGImageSourceGetCount(source)==1 else { fail("Use a single PNG or JPEG image.") }
  let props=CGImageSourceCopyPropertiesAtIndex(source,0,nil) as? [CFString:Any]
  let width=(props?[kCGImagePropertyPixelWidth] as? NSNumber)?.doubleValue ?? 0, height=(props?[kCGImagePropertyPixelHeight] as? NSNumber)?.doubleValue ?? 0
  guard width>0,height>0,width*height<=40_000_000 else { fail("Image must be at most 40 megapixels.") }
  let options:[CFString:Any]=[kCGImageSourceCreateThumbnailFromImageAlways:true,kCGImageSourceThumbnailMaxPixelSize:3200,kCGImageSourceCreateThumbnailWithTransform:true]
  guard let image=CGImageSourceCreateThumbnailAtIndex(source,0,options as CFDictionary) else { fail("Cannot decode source image.") }
  result=try recognize(image,1)
 }
 guard result.count<=3000,result.map({$0.text.count}).reduce(0,+)<=200_000 else { fail("Recognized document exceeds text limits.") }
 let bytes=try JSONEncoder().encode(Output(engine:"Apple Vision accurate / en-AU / v1",pages:count,lines:result));FileHandle.standardOutput.write(bytes)
 } catch { fail("Local recognition failed. Check document quality and retry.") }
