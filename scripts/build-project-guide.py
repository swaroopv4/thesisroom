"""Build the printable guide. Optional dependency: reportlab (not needed by the app)."""
from pathlib import Path
import argparse, html, re, textwrap
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, PageBreak,
                              Table, TableStyle, Preformatted, Flowable, Image)
from reportlab.platypus.tableofcontents import TableOfContents

parser=argparse.ArgumentParser()
parser.add_argument('--source',type=Path,default=Path('docs/PROJECT_GUIDE.md'))
parser.add_argument('--output',type=Path,default=Path('docs/ThesisRoom-Project-Guide.pdf'))
args=parser.parse_args()
args.output.parent.mkdir(parents=True,exist_ok=True)
fontdir=Path('C:/Windows/Fonts')
BODY,BOLD,ITALIC,MONO,SERIF='Helvetica','Helvetica-Bold','Helvetica-Oblique','Courier','Times-Roman'
if (fontdir/'segoeui.ttf').exists():
    for name,file in [('GuideBody','segoeui.ttf'),('GuideBold','segoeuib.ttf'),('GuideItalic','segoeuii.ttf'),('GuideMono','consola.ttf'),('GuideSerif','georgia.ttf')]:
        pdfmetrics.registerFont(TTFont(name,str(fontdir/file)))
    BODY,BOLD,ITALIC,MONO,SERIF='GuideBody','GuideBold','GuideItalic','GuideMono','GuideSerif'
pdfmetrics.registerFontFamily(BODY,normal=BODY,bold=BOLD,italic=ITALIC,boldItalic=BOLD)
NAVY=colors.HexColor('#173146');GREEN=colors.HexColor('#bddb9a');GRAY=colors.HexColor('#566b74')
WIDTH=504
styles={
 'body':ParagraphStyle('Body',fontName=BODY,fontSize=10.4,leading=14.6,textColor=NAVY,spaceAfter=7,splitLongWords=True),
 'h2':ParagraphStyle('Section',fontName=BOLD,fontSize=16,leading=21,textColor=NAVY,spaceBefore=18,spaceAfter=10,keepWithNext=True),
 'h3':ParagraphStyle('Subsection',fontName=BOLD,fontSize=12,leading=16,textColor=NAVY,spaceBefore=12,spaceAfter=7,keepWithNext=True),
 'small':ParagraphStyle('Small',fontName=BODY,fontSize=9,leading=12.5,textColor=GRAY,spaceAfter=7),
 'cell':ParagraphStyle('Cell',fontName=BODY,fontSize=9,leading=12,textColor=NAVY,spaceAfter=0,splitLongWords=True),
 'th':ParagraphStyle('TableHead',fontName=BOLD,fontSize=9,leading=12,textColor=colors.white,spaceAfter=0),
 'code':ParagraphStyle('Code',fontName=MONO,fontSize=7.7,leading=11,textColor=NAVY,backColor=colors.HexColor('#edf2f2'),borderPadding=9,spaceBefore=5,spaceAfter=13),
 'bullet':ParagraphStyle('Bullet',fontName=BODY,fontSize=10.4,leading=14.6,textColor=NAVY,spaceAfter=5,leftIndent=13,firstLineIndent=-10),
 'toc':ParagraphStyle('ContentsEntry',fontName=BODY,fontSize=10.5,leading=15,textColor=NAVY,spaceBefore=6,leftIndent=0,firstLineIndent=0),
}

def rich(text):
    # The Markdown source is controlled documentation, not arbitrary HTML.
    tokens=[]
    def save(value):
        tokens.append(value);return f'ZZTOKEN{len(tokens)-1}ZZ'
    def link(m):
        label,url=m.group(1),m.group(2)
        if url.startswith('../'):url='https://github.com/swaroopv4/thesisroom/blob/main/'+url[3:]
        return save(f'<a href="{html.escape(url,quote=True)}" color="#315f82">{html.escape(label)}</a>')
    text=re.sub(r'\[([^\]]+)\]\(([^)]+)\)',link,text)
    text=re.sub(r'`([^`]+)`',lambda m:save(f'<font name="{MONO}" size="9">{html.escape(m[1])}</font>'),text)
    text=html.escape(text)
    text=re.sub(r'\*\*(.+?)\*\*',r'<b>\1</b>',text)
    for i,value in enumerate(tokens):text=text.replace(f'ZZTOKEN{i}ZZ',value)
    return text

class Cover(Flowable):
    def __init__(self):
        super().__init__();self.width=WIDTH;self.height=164
    def draw(self):
        c=self.canv;c.setFillColor(NAVY);c.roundRect(0,0,self.width,self.height,12,fill=1,stroke=0)
        c.setFillColor(GREEN);c.setFont(BOLD,10);c.drawString(24,139,'PRODUCT + ENGINEERING DOCUMENTATION')
        c.setFillColor(colors.white);c.setFont(SERIF,34);c.drawString(23,88,'ThesisRoom')
        c.setFont(BODY,16);c.drawString(25,58,'Evidence-backed research. Human review.')
        c.setFillColor(colors.HexColor('#c8d7df'));c.setFont(BODY,10);c.drawString(25,26,'Project guide / October 21, 2026')

class Architecture(Flowable):
    def __init__(self):
        super().__init__();self.width=WIDTH;self.height=291
    def draw(self):
        c=self.canv
        def arrow(points):
            c.setStrokeColor(colors.HexColor('#78919a'));c.setLineWidth(1.2)
            p=c.beginPath();p.moveTo(*points[0])
            for point in points[1:]:p.lineTo(*point)
            c.drawPath(p)
            x,y=points[-1];px,py=points[-2]
            if y<py:tip=[(x,y),(x-3,y+6),(x+3,y+6)]
            elif y>py:tip=[(x,y),(x-3,y-6),(x+3,y-6)]
            elif x>px:tip=[(x,y),(x-6,y-3),(x-6,y+3)]
            else:tip=[(x,y),(x+6,y-3),(x+6,y+3)]
            p=c.beginPath();p.moveTo(*tip[0]);p.lineTo(*tip[1]);p.lineTo(*tip[2]);p.close();c.setFillColor(colors.HexColor('#78919a'));c.drawPath(p,fill=1,stroke=0)
        def node(x,y,w,h,title,detail,dark=False):
            c.setFillColor(NAVY if dark else colors.HexColor('#edf2ed'));c.roundRect(x,y,w,h,7,fill=1,stroke=0)
            c.setFillColor(colors.white if dark else NAVY);c.setFont(BOLD,9.3);c.drawCentredString(x+w/2,y+h-16,title)
            c.setFont(BODY,8.4);c.drawCentredString(x+w/2,y+10,detail)
        arrow([(252,235),(252,217)])
        arrow([(252,175),(252,154)])
        arrow([(252,108),(252,80)])
        arrow([(163,196),(77,196),(77,80)])
        arrow([(341,196),(427,196),(427,80)])
        node(163,235,178,42,'BROWSER','React UI + local PDF text extraction',True)
        node(163,175,178,42,'AUTHENTICATED API','Read state / validate / save revision',True)
        node(163,108,178,46,'DETERMINISTIC CORE','Retrieve / compare / track source versions')
        node(4,36,146,44,'D1 / SQLITE','One JSON workspace per user')
        node(179,36,146,44,'OPTIONAL GROQ','Selected evidence -> checked draft')
        node(354,36,146,44,'SEC ENDPOINT','Filing metadata and original links')
        c.setFont(BODY,8.4);c.setFillColor(GRAY);c.drawString(5,12,'Provider and SEC calls are HTTP requests. Workspace data and runtime secrets are separate.')

def footer(canvas,doc):
    canvas.saveState()
    if doc.page>1:
        canvas.setFont(BOLD,8);canvas.setFillColor(GRAY);canvas.drawString(54,759,'THESISROOM / PROJECT GUIDE')
        canvas.setStrokeColor(colors.HexColor('#d4dedf'));canvas.line(54,749,558,749)
    canvas.setStrokeColor(colors.HexColor('#d4dedf'));canvas.line(54,39,558,39)
    canvas.setFillColor(GRAY);canvas.setFont(BODY,8)
    canvas.drawString(54,25,'Code snapshot: 69d333a | Portfolio prototype')
    canvas.drawRightString(558,25,str(doc.page));canvas.restoreState()

class GuideDoc(SimpleDocTemplate):
    def afterFlowable(self,flowable):
        if isinstance(flowable,Paragraph) and hasattr(flowable,'bookmark'):
            self.canv.bookmarkPage(flowable.bookmark)
            self.canv.addOutlineEntry(flowable.getPlainText(),flowable.bookmark,0,False)
            self.notify('TOCEntry',(0,flowable.getPlainText(),self.page,flowable.bookmark))

story=[Cover(),Spacer(1,18),Paragraph('A practical reference for understanding the product, tracing requests through the implementation, running the app, and explaining its engineering decisions.',styles['body']),Spacer(1,9)]
poster=args.source.parent/'demo-poster.jpg'
if poster.exists():story += [Image(str(poster),width=480,height=270),Spacer(1,12)]
story += [Paragraph('<b>Reviewed source:</b> 69d333af6b4ca15ed3132dbb4764ad47aaae1832',styles['small']),Paragraph('<b>Repository:</b> <a href="https://github.com/swaroopv4/thesisroom" color="#315f82">github.com/swaroopv4/thesisroom</a>',styles['small']),Paragraph('Implemented behavior, live smoke checks, limitations, and proposed future work are identified separately.',styles['small']),PageBreak(),Paragraph('Contents',styles['h2'])]
toc=TableOfContents();toc.levelStyles=[styles['toc']]
story += [toc,PageBreak()]

source=args.source.read_text(encoding='utf-8').splitlines()
start=next(i for i,line in enumerate(source) if line.startswith('## 1. '))
i=start;sections=0
while i<len(source):
    line=source[i].strip()
    if not line:i+=1;continue
    if line.startswith('```'):
        language=line[3:];block=[];i+=1
        while i<len(source) and not source[i].startswith('```'):block.append(source[i]);i+=1
        if language=='mermaid':story += [Architecture(),Spacer(1,7)]
        else:
            wrapped=[]
            for entry in block:wrapped.extend(textwrap.wrap(entry,99,replace_whitespace=False,drop_whitespace=False,break_long_words=True,break_on_hyphens=False) or [''])
            story.append(Preformatted('\n'.join(wrapped),styles['code']))
        i+=1;continue
    if line.startswith('## '):
        sections+=1;p=Paragraph(rich(line[3:]),styles['h2']);p.bookmark=f'section-{sections}';story.append(p);i+=1;continue
    if line.startswith('### '):story.append(Paragraph(rich(line[4:]),styles['h3']));i+=1;continue
    if line.startswith('|'):
        rows=[]
        while i<len(source) and source[i].strip().startswith('|'):
            cells=[x.strip() for x in source[i].strip().strip('|').split('|')]
            if not all(re.fullmatch(r':?-+:?',cell.replace(' ','')) for cell in cells):rows.append(cells)
            i+=1
        count=len(rows[0]);widths=[148,356] if count==2 else [90,145,269]
        data=[[Paragraph(rich(cell),styles['th'] if n==0 else styles['cell']) for cell in row] for n,row in enumerate(rows)]
        table=Table(data,colWidths=widths,repeatRows=1,hAlign='LEFT')
        table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),NAVY),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.HexColor('#f2f5f3'),colors.white]),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),('LINEBELOW',(0,0),(-1,0),.5,NAVY)]))
        story += [table,Spacer(1,10)];continue
    if re.match(r'^- ',line) or re.match(r'^\d+\. ',line):
        text='- '+line[2:] if line.startswith('- ') else line
        story.append(Paragraph(rich(text),styles['bullet']));i+=1;continue
    paragraph=[line];i+=1
    while i<len(source) and source[i].strip() and not re.match(r'^(#{2,3} |```|\||- |\d+\. )',source[i].strip()):paragraph.append(source[i].strip());i+=1
    story.append(Paragraph(rich(' '.join(paragraph)),styles['body']))

doc=GuideDoc(str(args.output),pagesize=letter,rightMargin=54,leftMargin=54,topMargin=54,bottomMargin=53,title='ThesisRoom - Project Guide',author='Swaroop Veerla',subject='Product, architecture, implementation, setup, and interview reference')
doc.multiBuild(story,onFirstPage=footer,onLaterPages=footer)
print(f'Created {args.output}; {sections} documented sections.')
