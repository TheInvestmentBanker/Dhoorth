const jwt=require("jsonwebtoken"),User=require("../models");
async function protect(req,res,next){try{const h=req.headers.authorization||"",t=h.startsWith("Bearer ")?h.slice(7):null;if(!t)return res.status(401).json({message:"Authentication required"});const d=jwt.verify(t,process.env.JWT_SECRET),u=await User.findById(d.id).select("-password");if(!u)throw Error();req.user=u;next()}catch(e){res.status(401).json({message:"Invalid or expired session"})}}
function authorOnly(req,res,next){req.user?.role==="author"?next():res.status(403).json({message:"Author access required"})}
module.exports={protect,authorOnly};
