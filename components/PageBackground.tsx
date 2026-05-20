export default function PageBackground() {
  return (
    <>
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          backgroundImage: "url('/imagenes/iamgen%20oficial.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundAttachment: 'fixed',
          filter: 'blur(2px) brightness(0.42) saturate(1.3)',
        }}
      />
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{ background: 'linear-gradient(160deg, rgba(8,20,36,0.45) 0%, rgba(4,12,24,0.6) 100%)' }}
      />
    </>
  )
}
